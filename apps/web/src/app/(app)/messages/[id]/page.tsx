// app/messages/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import Loader from "@/components/loader";
import { getClientCookie } from "@/utils/client/cookies";
import { supabase } from "@/lib/supabase/api";

interface HelpRequestConversation {
  id: string;
  created_at: string;
  requester_email: string;
  responder_email: string;
  help_request_id: string;
  help_request_title: string;
  last_message_text?: string;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  deleted: boolean;
  users: any;
}
export default function MessageThreadPage() {
  const router = useRouter();
  const { id } = useParams();
  const conversationId = Array.isArray(id) ? id[0] : id;

  const [conversation, setConversation] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${id}-messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT", // test with only INSERT first
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${id}`,
        },
        (payload) => {
          console.log("🔥 New message:", payload.new);
          const appUser = getClientCookie("app-user");
          console.log("Current user:", appUser);
          if (payload.new.sender_id === appUser?.id) return; //skip if the message is from the current user
          fetchConversationData(false);
          //setMessages((prev) => [...prev, payload.new as Message]);
          //sends double messages
        }
      )
      .subscribe();
    const fetchConversationData = async (loadMessages = true) => {
      loadMessages && setLoading(true);
      setError(null);

      try {
        // Get current user
        const appUser = getClientCookie("app-user");
        if (!appUser) {
          router.push("/api/auth/logout");
          return;
        }
        setUser(appUser);
        const req = await fetch(`/api/chats/${id}`);
        if (!req.ok) {
          throw new Error(`Failed to fetch conversation: ${req.statusText}`);
        }
        const res = await req.json();
        // Try to load help-request conversation

        if (res.data) {
          try {
            const conv = res.data;
            conv.recipient.full_name =
              conv.recipient.first_name + " " + conv.recipient.last_name;
            setConversation(conv);
            // Load messages
            setMessages((res.data.messages as Message[]) || []);

            setLoading(false);
            return;
          } catch (e) {
            console.warn("Failed to load help request conversations", e);
          }
        }

        setError("Conversation not found.");
        setLoading(false);
      } catch (err) {
        //console.error("Error loading conversation:", err);
        //setError((err as any)?.message || "Failed to load conversation.");
        router.push("/messages");
        setLoading(false);
      }
    };

    fetchConversationData();
    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBack = () => router.push("/messages");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;
    //optimistic update for better UX
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");

    //process the new message
    const newMsg: any = {
      chat_id: conversation.id as string,
      content: newMessage.trim(),
      sender_id: user.id,
      created_at: new Date().toISOString(),
      users: user,
    };
    //send to api
    const req = await fetch(`/api/chats/${conversation.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMsg.content }),
    });

    const res = await req.json();
    if (!req.ok) {
      alert(`Failed to send message: ${res.error || req.statusText}`);
      //remove the optimistic message
      setMessages((prev) => prev.filter((msg) => msg !== newMsg));
      return;
    }
  };

  const deleteConversation = () => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Error: {error || "Conversation not found"}
          </p>
          <button
            onClick={handleBack}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-3 flex-1">
            <img
              src={
                conversation.recipient.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  conversation.recipient.full_name || "User"
                )}&background=4F46E5&color=fff`
              }
              alt={conversation.recipient.full_name}
              className="w-10 h-10 rounded-full border-2 border-blue-500"
            />
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white">
                {conversation.recipient.full_name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help Request • {conversation.help_request_title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={deleteConversation}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2"
              title="Delete conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Chat */}
      <main className="flex-grow container mx-auto px-4 py-4 flex flex-col max-w-3xl w-full">
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Help Request:{" "}
            <span className="font-bold">{conversation.help_request_title}</span>
          </p>
        </div>

        <div className="flex-grow overflow-y-auto pb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isOwn = msg.sender_id === user.id;

              return (
                <div
                  key={i}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none"
                    }`}
                  >
                    {!isOwn && (
                      <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                        {conversation.recipient.full_name}
                      </div>
                    )}
                    <p className="break-words">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
