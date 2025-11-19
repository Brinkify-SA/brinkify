// app/messages/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import Loader from '@/components/loader';

interface HelpRequestMessage {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_email: string;
  text: string;
}

interface HelpRequestConversation {
  id: string;
  created_at: string;
  requester_email: string;
  responder_email: string;
  help_request_id: string;
  help_request_title: string;
  last_message_text?: string;
}

export default function MessageThreadPage() {
  const router = useRouter();
  const { id } = useParams();
  const conversationId = Array.isArray(id) ? id[0] : id;

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isHelpRequest, setIsHelpRequest] = useState(false);
  const [conversation, setConversation] = useState<HelpRequestConversation | null>(null);
  const [messages, setMessages] = useState<HelpRequestMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversationData = () => {
      setLoading(true);
      setError(null);

      try {
        // Get current user
        const storedEmail = localStorage.getItem('userEmail');
        if (!storedEmail) {
          router.push('/auth/login');
          return;
        }
        setUserEmail(storedEmail);

        // Try to load help-request conversation
        const rawConvs = localStorage.getItem('conversations');
        if (rawConvs) {
          try {
            const convs: HelpRequestConversation[] = JSON.parse(rawConvs);
            const found = convs.find((c) => c.id === conversationId);

            if (found) {
              setIsHelpRequest(true);
              setConversation(found);

              // Load messages
              const rawMsgs = localStorage.getItem('help_request_messages');
              if (rawMsgs) {
                try {
                  const allMsgs: HelpRequestMessage[] = JSON.parse(rawMsgs);
                  const convMsgs = allMsgs.filter((m) => m.conversation_id === conversationId);
                  convMsgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                  setMessages(convMsgs);
                } catch (e) {
                  console.warn('Failed to load messages', e);
                }
              }
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to load help request conversations', e);
          }
        }

        setError('Conversation not found.');
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading conversation:', err);
        setError(err.message || 'Failed to load conversation.');
        setLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBack = () => router.push('/messages');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userEmail || !conversation) return;

    const newMsg: HelpRequestMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      created_at: new Date().toISOString(),
      conversation_id: conversationId as string,
      sender_email: userEmail,
      text: newMessage.trim(),
    };

    // Update messages in localStorage
    const rawMsgs = localStorage.getItem('help_request_messages');
    let allMsgs: HelpRequestMessage[] = [];
    if (rawMsgs) {
      try {
        allMsgs = JSON.parse(rawMsgs);
      } catch (e) {
        console.warn('Failed to parse messages');
      }
    }

    allMsgs.push(newMsg);
    localStorage.setItem('help_request_messages', JSON.stringify(allMsgs));

    // Update conversation last message
    const rawConvs = localStorage.getItem('conversations');
    if (rawConvs) {
      try {
        const convs: HelpRequestConversation[] = JSON.parse(rawConvs);
        const updated = convs.map((c) =>
          c.id === conversationId ? { ...c, last_message_text: newMessage.trim() } : c
        );
        localStorage.setItem('conversations', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update conversation', e);
      }
    }

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage('');
  };

  const deleteConversation = () => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      // Remove conversation
      const rawConvs = localStorage.getItem('conversations');
      if (rawConvs) {
        const convs: HelpRequestConversation[] = JSON.parse(rawConvs);
        const filtered = convs.filter((c) => c.id !== conversationId);
        localStorage.setItem('conversations', JSON.stringify(filtered));
      }

      // Remove messages
      const rawMsgs = localStorage.getItem('help_request_messages');
      if (rawMsgs) {
        const allMsgs: HelpRequestMessage[] = JSON.parse(rawMsgs);
        const filtered = allMsgs.filter((m) => m.conversation_id !== conversationId);
        localStorage.setItem('help_request_messages', JSON.stringify(filtered));
      }

      router.push('/messages');
    } catch (err: any) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation.');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error || 'Conversation not found'}</p>
          <button onClick={handleBack} className="text-blue-600 dark:text-blue-400 hover:underline">
            Go Back to Messages
          </button>
        </div>
      </div>
    );
  }

  const otherEmail =
    userEmail === conversation.requester_email
      ? conversation.responder_email
      : conversation.requester_email;

  const otherName =
    otherEmail === 'homeowner@test.com'
      ? 'John Homeowner'
      : otherEmail === 'worker@test.com'
      ? 'Sarah Worker'
      : otherEmail;

  const otherAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherName.split(' ')[0]}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button onClick={handleBack} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-3 flex-1">
            <img
              src={otherAvatar}
              alt={otherName}
              className="w-10 h-10 rounded-full border-2 border-blue-500"
            />
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white">{otherName}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Help Request • {conversation.help_request_title}</p>
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
            Help Request: <span className="font-bold">{conversation.help_request_title}</span>
          </p>
        </div>

        <div className="flex-grow overflow-y-auto pb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_email === userEmail;
              const senderName =
                msg.sender_email === 'homeowner@test.com'
                  ? 'John Homeowner'
                  : msg.sender_email === 'worker@test.com'
                  ? 'Sarah Worker'
                  : msg.sender_email;

              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
                    }`}
                  >
                    {!isOwn && (
                      <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                        {senderName}
                      </div>
                    )}
                    <p className="break-words">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
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
