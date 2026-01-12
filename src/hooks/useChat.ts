import { useState, useEffect, useCallback } from 'react';
import { sendChatMessage, sendChatMessageStream, deleteChatConversation } from "@/lib/api";   
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, Message, HedgeAPIResponse, ThinkingStep, SearchResult } from '@/types/chat';

async function enrichResultsWithSeriesTicker(results: SearchResult[]): Promise<SearchResult[]> {
  const missingEventIds = Array.from(
    new Set(
      results
        .filter((r) => r?.event_id && !r?.series_ticker)
        .map((r) => r.event_id)
    )
  );

  if (missingEventIds.length === 0) return results;

  const { data: events, error } = await supabase
    .from('kalshi_events')
    .select('id, series_ticker')
    .in('id', missingEventIds);

  if (error || !events) return results;

  const tickerMap = new Map(events.map((e) => [e.id, e.series_ticker] as const));

  return results.map((r) => ({
    ...r,
    series_ticker: r.series_ticker ?? tickerMap.get(r.event_id) ?? undefined,
  }));
}

export function useChat(userId: string | undefined) {
  const debugStream = import.meta.env.DEV;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    // Restore active conversation from localStorage on mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeConversationId');
    }
    return null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [isStreamingRef] = useState<{ current: boolean }>({ current: false });

  // Persist active conversation to localStorage
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('activeConversationId', activeConversationId);
    } else {
      localStorage.removeItem('activeConversationId');
    }
  }, [activeConversationId]);

  // Load conversations
  useEffect(() => {
    if (!userId) return;

    async function loadConversations() {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setConversations(data);
        
        // Validate that the stored activeConversationId still exists
        const storedId = localStorage.getItem('activeConversationId');
        if (storedId && !data.find(c => c.id === storedId)) {
          // Conversation was deleted, clear it
          localStorage.removeItem('activeConversationId');
          setActiveConversationId(null);
        }
      }
      setConversationsLoading(false);
    }

    loadConversations();
  }, [userId]);

  // Load deleted conversations (for trash view)
  useEffect(() => {
    if (!userId) return;

    async function loadDeletedConversations() {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });

      if (!error && data) {
        setDeletedConversations(data);
      }
    }

    loadDeletedConversations();
  }, [userId]);

  // Load messages when active conversation changes
  useEffect(() => {
    // NOTE: When creating a brand-new chat, `activeConversationId` is temporarily null
    // until the streaming endpoint emits `conversation_id`. We should NOT clear messages
    // in that window, otherwise we wipe the optimistic user + streaming assistant messages.
    if (!userId) {
      setMessages([]);
      return;
    }
    if (!activeConversationId) {
      return;
    }
    
    // CRITICAL: Don't reload messages from DB while actively streaming,
    // otherwise we'll overwrite the optimistic/streaming messages!
    if (isStreamingRef.current) {
      return;
    }

    async function loadMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        // Load reactions and saved status for all messages
        const messageIds = data.map(m => m.id);
        
        const [reactionsData, savedData] = await Promise.all([
          supabase
            .from('message_reactions')
            .select('message_id, reaction_type')
            .in('message_id', messageIds)
            .eq('user_id', userId),
          supabase
            .from('saved_messages')
            .select('message_id')
            .in('message_id', messageIds)
            .eq('user_id', userId)
        ]);

        const reactionsMap = new Map(
          reactionsData.data?.map(r => [r.message_id, r.reaction_type]) || []
        );
        const savedSet = new Set(savedData.data?.map(s => s.message_id) || []);

        const mapped: Message[] = data.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          response_data: msg.response_data as unknown as HedgeAPIResponse | null,
          reaction: reactionsMap.get(msg.id) as 'like' | 'dislike' | null,
          is_saved: savedSet.has(msg.id),
        }));

        // Ensure old conversations also get a Kalshi link (by enriching stored results)
        // Support both old format (results) and new format (markets)
        const allResults = mapped.flatMap((m) => {
          const markets = m.response_data?.markets || m.response_data?.results || [];
          return markets;
        });
        
        if (allResults.length > 0) {
          const enrichedResults = await enrichResultsWithSeriesTicker(allResults as SearchResult[]);
          const byEventId = new Map(enrichedResults.map((r) => [r.event_id, r] as const));

          const enrichedMessages = mapped.map((m) => {
            const markets = m.response_data?.markets || m.response_data?.results;
            if (!markets?.length) return m;
            
            const enrichedMarkets = markets.map((r) => byEventId.get(r.event_id) ?? r);
            
            return {
              ...m,
              response_data: {
                ...m.response_data,
                markets: enrichedMarkets,
                results: enrichedMarkets,
              },
            };
          });

          setMessages(enrichedMessages);
        } else {
          setMessages(mapped);
        }
      }
    }

    loadMessages();
  }, [activeConversationId, userId]);

  const createConversation = useCallback(
    async (initialMessage?: string) => {
      if (!userId) return null;

      // Start with a temporary title - the backend will update it with AI-generated title
      const title = 'New Chat';

      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (!error && data) {
        setConversations((prev) => [data, ...prev]);
        setActiveConversationId(data.id);
        return data.id;
      }
      return null;
    },
    [userId]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || loading) return;

      let conversationId = activeConversationId;

      setLoading(true);
      isStreamingRef.current = true; // Mark as streaming to prevent DB reload

      // Add user message optimistically (for immediate UI feedback)
      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        role: 'user',
        content,
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      try {
        // Create a streaming assistant message
        const streamingMessageId = `streaming-${Date.now()}`;
        const streamingMessage: Message = {
          id: streamingMessageId,
          role: 'assistant',
          content: '',
          thinking: [],
          isStreaming: true,
        };
        setMessages((prev) => [...prev, streamingMessage]);

        let newConversationId = conversationId || '';
        let currentThinkingStep: ThinkingStep | null = null;
        let outputContent = '';

        // Stream the response
        await sendChatMessageStream(
          {
            conversation_id: conversationId || undefined,
            message: content,
            user_id: userId,
          },
          (event) => {
            // Log all events to console for debugging
            if (debugStream) console.log('[Stream Event]', event);
            
            if (event.type === 'conversation_id') {
              newConversationId = event.data || '';
              
              // Update conversation ID if this was a new conversation
              if (!conversationId) {
                conversationId = newConversationId;
                setActiveConversationId(newConversationId);
                
                // Reload conversations list to include the new one
                supabase
                  .from('conversations')
                  .select('*')
                  .eq('id', newConversationId)
                  .single()
                  .then(({ data: newConv }) => {
                    if (newConv) {
                      setConversations((prev) => [newConv, ...prev]);
                    }
                  });
              }
            } else if (event.type === 'thinking_start') {
              // Start a new thinking step
              if (debugStream) console.log('[Thinking] Started new thinking step');
              currentThinkingStep = {
                content: '',
                timestamp: Date.now(),
              };
              
              // Add the thinking step to the array
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingMessageId
                    ? { ...m, thinking: [...(m.thinking || []), currentThinkingStep!] }
                    : m
                )
              );
            } else if (event.type === 'thinking') {
              // Add to current thinking step
              if (currentThinkingStep && event.content) {
                currentThinkingStep.content += event.content;
                if (debugStream) console.log('[Thinking] Content:', currentThinkingStep.content.substring(0, 50) + '...');
                
                // Update the message with the current thinking
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingMessageId
                      ? {
                          ...m,
                          thinking: [
                            ...(m.thinking || []).slice(0, -1),
                            currentThinkingStep!,
                          ],
                        }
                      : m
                  )
                );
              }
            } else if (event.type === 'thinking_end') {
              // Finalize the thinking step
              if (debugStream) console.log('[Thinking] Ended thinking step');
              currentThinkingStep = null;
            } else if (event.type === 'output') {
              // Add to output content
              if (event.content) {
                outputContent += event.content;
                if (debugStream) console.log('[Output] Content:', outputContent.substring(0, 50) + '...');
                
                // Update the message with the current output
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingMessageId
                      ? { ...m, content: outputContent }
                      : m
                  )
                );
              }
            } else if (event.type === 'markets') {
              // Attach markets to the streaming message so the UI can render cards
              if (debugStream) console.log('[Markets] Received markets event with', event.results?.length || 0, 'results');
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingMessageId
                    ? {
                        ...m,
                        response_data: {
                          query: event.query,
                          results: event.results,
                        },
                      }
                    : m
                )
              );
            } else if (event.type === 'done') {
              const finalMessageId = event.message_id || '';
              
              // Mark streaming as complete
              isStreamingRef.current = false;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingMessageId
                    ? { ...m, id: finalMessageId, isStreaming: false }
                    : m
                )
              );

              // Update conversation title in the list
              supabase
                .from('conversations')
                .select('*')
                .eq('id', newConversationId)
                .single()
                .then(({ data: updatedConv }) => {
                  if (updatedConv) {
                    setConversations((prev) =>
                      prev.map((c) => (c.id === newConversationId ? updatedConv : c))
                    );
                  }
                });
            } else if (event.type === 'error') {
              console.error('Stream error:', event.message);
              isStreamingRef.current = false;
              
              // Remove streaming message and show error
              setMessages((prev) =>
                prev.filter((m) => m.id !== streamingMessageId)
              );
              
              const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `Sorry, there was an error: ${event.message}. Please try again.`,
              };
              setMessages((prev) => [...prev, errorMessage]);
            }
          }
        );
      } catch (error) {
        console.error('Error calling chat API:', error);
        isStreamingRef.current = false;
        
        // Remove the optimistic user message and streaming message
        setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-') && !m.id.startsWith('streaming-')));
        
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your message. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }

      isStreamingRef.current = false;
      setLoading(false);
    },
    [userId, loading, activeConversationId, conversations]
  );

  const deleteConversation = useCallback(async (id: string) => {
    if (!userId) return;
    
    try {
      const now = new Date().toISOString();
      // Soft delete: mark as deleted instead of hard delete
      await supabase
        .from('conversations')
        .update({
          is_deleted: true,
          deleted_at: now
        })
        .eq('id', id)
        .eq('user_id', userId);

      // Move from active to deleted conversations
      const deleted = conversations.find(c => c.id === id);
      if (deleted) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setDeletedConversations((prev) => [{ ...deleted, is_deleted: true, deleted_at: now }, ...prev]);
      }
      
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [activeConversationId, userId, conversations]);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  const restoreConversation = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      // Move from deleted to active conversations
      const restored = deletedConversations.find(c => c.id === id);
      if (restored) {
        setDeletedConversations(prev => prev.filter(c => c.id !== id));
        setConversations(prev => [{ ...restored, is_deleted: false, deleted_at: null }, ...prev]);
      }
    } catch (error) {
      console.error('Error restoring conversation:', error);
    }
  }, [userId, deletedConversations]);

  const permanentlyDeleteConversation = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setDeletedConversations(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error permanently deleting conversation:', error);
    }
  }, [userId]);

  return {
    conversations,
    deletedConversations,
    activeConversationId,
    messages,
    loading,
    conversationsLoading,
    setActiveConversationId,
    sendMessage,
    deleteConversation,
    restoreConversation,
    permanentlyDeleteConversation,
    startNewChat,
  };
}
