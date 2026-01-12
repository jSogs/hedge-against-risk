import { useCallback, useState } from 'react';
import { Bookmark, BookmarkCheck, ChevronDown, Copy, RotateCcw, Sparkles, ThumbsDown, ThumbsUp, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarketResultCard } from './MarketResultCard';
import type { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useChatContext } from '@/context/ChatContext';
import { toast } from 'sonner';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { user } = useAuth();
  const { sendMessage, messages } = useChatContext();
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(message.reaction || null);
  const [isSaved, setIsSaved] = useState(message.is_saved || false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [message.content]);

  const handleReaction = useCallback(async (type: 'like' | 'dislike') => {
    if (!user) return;

    try {
      // Toggle reaction
      if (reaction === type) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', message.id)
          .eq('user_id', user.id);
        setReaction(null);
      } else {
        // Add or update reaction
        await supabase
          .from('message_reactions')
          .upsert({
            message_id: message.id,
            user_id: user.id,
            reaction_type: type,
          }, {
            onConflict: 'message_id,user_id'
          });
        setReaction(type);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
  }, [message.id, user, reaction]);

  const handleSave = useCallback(async () => {
    if (!user) return;

    try {
      if (isSaved) {
        // Unsave
        await supabase
          .from('saved_messages')
          .delete()
          .eq('message_id', message.id)
          .eq('user_id', user.id);
        setIsSaved(false);
        toast.success('Removed from saved');
      } else {
        // Save
        await supabase
          .from('saved_messages')
          .insert({
            message_id: message.id,
            user_id: user.id,
          });
        setIsSaved(true);
        toast.success('Message saved');
      }
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
    }
  }, [message.id, user, isSaved]);

  const handleRegenerate = useCallback(async () => {
    if (!user || isRegenerating) return;

    // Find the user message that prompted this assistant response
    const currentIndex = messages.findIndex(m => m.id === message.id);
    if (currentIndex <= 0) return;

    const previousUserMessage = messages[currentIndex - 1];
    if (previousUserMessage.role !== 'user') return;

    setIsRegenerating(true);
    try {
      // Delete the current assistant message
      await supabase
        .from('chat_messages')
        .delete()
        .eq('id', message.id);

      // Resend the user's message to get a new response
      await sendMessage(previousUserMessage.content);
      toast.success('Response regenerated');
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast.error('Failed to regenerate response');
    } finally {
      setIsRegenerating(false);
    }
  }, [message.id, user, isRegenerating, messages, sendMessage]);

  return (
    <div className={cn("w-full", isUser ? "flex justify-end" : "flex justify-start")}>
      {isUser ? (
        <div className="max-w-[70%] rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      ) : (
        <div className="w-full max-w-[48rem] space-y-4">
          {/* Meta row (ChatGPT-style) */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Thought for a few seconds</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>

          {/* Assistant content with markdown */}
          <div className="text-sm leading-relaxed text-foreground prose prose-sm max-w-none prose-p:my-3 prose-headings:my-4 prose-ul:my-3 prose-ol:my-3 prose-li:my-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Market cards (keep existing) */}
          {message.response_data?.results && message.response_data.results.length > 0 && (
            <div className="space-y-3 pt-2">
              {message.response_data.results.map((result) => (
                <MarketResultCard key={result.event_id} result={result} />
              ))}
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-1 pt-2 text-muted-foreground">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleCopy} 
              aria-label="Copy"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", isSaved && "text-primary")}
              onClick={handleSave} 
              aria-label="Save"
            >
              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", reaction === 'like' && "text-primary")}
              onClick={() => handleReaction('like')} 
              aria-label="Thumbs up"
            >
              <ThumbsUp className={cn("h-4 w-4", reaction === 'like' && "fill-current")} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", reaction === 'dislike' && "text-destructive")}
              onClick={() => handleReaction('dislike')} 
              aria-label="Thumbs down"
            >
              <ThumbsDown className={cn("h-4 w-4", reaction === 'dislike' && "fill-current")} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              aria-label="Regenerate"
            >
              <RotateCcw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
