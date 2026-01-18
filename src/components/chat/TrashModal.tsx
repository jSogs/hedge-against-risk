import { useState, useMemo } from "react";
import { Trash2, Undo2, X, Search, AlertTriangle } from "lucide-react";
import { useChatContext } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TrashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrashModal({ open, onOpenChange }: TrashModalProps) {
  const { deletedConversations, restoreConversation, permanentlyDeleteConversation } = useChatContext();
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return deletedConversations;
    return deletedConversations.filter((c) => (c.title || "New Chat").toLowerCase().includes(q));
  }, [deletedConversations, query]);

  const handleRestore = async (id: string) => {
    await restoreConversation(id);
  };

  const handlePermanentDelete = async (id: string) => {
    await permanentlyDeleteConversation(id);
    setDeleteId(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trash2 className="h-5 w-5 text-destructive" />
              Trash
            </DialogTitle>
            <DialogDescription>
              Deleted chats are kept for 30 days. Restore them or delete permanently.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trash..."
                className="pl-9 pr-9 bg-muted/30"
              />
              {query.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="max-h-[50vh]">
            <div className="px-6 py-4">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Trash2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {deletedConversations.length === 0 
                      ? "Trash is empty" 
                      : "No matches found"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((chat) => {
                    const daysUntilDelete = chat.deleted_at 
                      ? Math.max(0, 30 - Math.floor((Date.now() - new Date(chat.deleted_at).getTime()) / (1000 * 60 * 60 * 24)))
                      : 30;

                    return (
                      <div
                        key={chat.id}
                        className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate mb-1">
                            {chat.title || "New Chat"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Deleted {new Date(chat.deleted_at!).toLocaleDateString()} · {daysUntilDelete} days remaining
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(chat.id)}
                            className="gap-2"
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            Restore
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(chat.id)}
                            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Permanent Delete */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This chat will be permanently deleted and cannot be recovered. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handlePermanentDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}






