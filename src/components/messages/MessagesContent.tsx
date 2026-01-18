"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

/**
 * Messages Content Component
 *
 * Two-panel layout: conversation list + active thread.
 * Stories 6-1, 6-2, 6-4, 6-5.
 */
export function MessagesContent() {
  const searchParams = useSearchParams();
  const initialPartnerId = searchParams.get("user");
  const contextType = searchParams.get("context") as "LISTING_INQUIRY" | "BOOKING_COORDINATION" | "GENERAL" | null;
  const contextId = searchParams.get("contextId");

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(initialPartnerId);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, refetch: refetchConversations } = api.message.getConversations.useQuery();

  const { data: threadData, refetch: refetchThread } = api.message.getThread.useQuery(
    { partnerId: selectedPartnerId! },
    { enabled: !!selectedPartnerId }
  );

  const { data: contextData } = api.message.getOrCreateConversation.useQuery(
    {
      partnerId: selectedPartnerId!,
      contextType: contextType ?? "GENERAL",
      contextId: contextId ?? undefined,
    },
    { enabled: !!selectedPartnerId && !!contextType }
  );

  const sendMessage = api.message.send.useMutation({
    onSuccess: () => {
      setMessageInput("");
      refetchThread();
      refetchConversations();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadData?.messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedPartnerId) {
        refetchThread();
      }
      refetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedPartnerId, refetchThread, refetchConversations]);

  function handleSend() {
    if (!messageInput.trim() || !selectedPartnerId) return;

    sendMessage.mutate({
      receiverId: selectedPartnerId,
      content: messageInput.trim(),
      contextType: contextType ?? undefined,
      contextId: contextId ?? undefined,
    });
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {conversations?.length === 0 ? (
            <div className="flex flex-col items-center py-8 px-4">
              <div className="mb-4 rounded-full bg-muted p-4">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                No conversations yet. Message a member to start chatting!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations?.map((conv) => (
                <button
                  key={conv.partnerId}
                  type="button"
                  onClick={() => setSelectedPartnerId(conv.partnerId)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    selectedPartnerId === conv.partnerId ? "bg-muted" : ""
                  }`}
                >
                  {conv.partner.image ? (
                    <CldImage
                      src={conv.partner.image}
                      alt={conv.partner.name ?? "User"}
                      width={48}
                      height={48}
                      crop="fill"
                      gravity="face"
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                      {conv.partner.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conv.partner.name ?? "Member"}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Thread */}
      <Card className="lg:col-span-2 flex flex-col">
        {!selectedPartnerId ? (
          <CardContent className="flex flex-1 items-center justify-center py-16">
            <div className="text-center">
              <div className="mb-4 inline-flex rounded-full bg-muted p-4">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choose a conversation from the list or start a new one
              </p>
            </div>
          </CardContent>
        ) : (
          <>
            {/* Thread Header */}
            <CardHeader className="border-b pb-3">
              <div className="flex items-center gap-3">
                {threadData?.partner.image ? (
                  <CldImage
                    src={threadData.partner.image}
                    alt={threadData.partner.name ?? "User"}
                    width={40}
                    height={40}
                    crop="fill"
                    gravity="face"
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {threadData?.partner.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <div>
                  <Link
                    href={`/members/${selectedPartnerId}`}
                    className="font-semibold hover:underline"
                  >
                    {threadData?.partner.name ?? "Member"}
                  </Link>
                  {/* Context badge */}
                  {contextData?.contextDetails && contextType === "LISTING_INQUIRY" && (
                    <p className="text-sm text-muted-foreground">
                      Inquiry about: {(contextData.contextDetails as { title: string }).title}
                    </p>
                  )}
                  {contextData?.contextDetails && contextType === "BOOKING_COORDINATION" && (
                    <p className="text-sm text-muted-foreground">
                      Booking at: {(contextData.contextDetails as { home: { title: string } }).home.title}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "400px" }}>
              <div className="space-y-4">
                {threadData?.messages.map((message) => {
                  const isOwn = message.sender.id === threadData.partner.id ? false : true;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p
                          className={`mt-1 text-xs ${
                            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? (
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
