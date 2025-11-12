// app/messages/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { ArrowLeft, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Loader from '@/components/loader'; // Assuming a Loader component exists

interface UserProfile {
  id: string;
  full_name: string;
  role: 'worker' | 'customer' | 'company';
  avatar_url: string;
}

interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  text: string;
}

interface ConversationDetail {
  id: string;
  created_at: string;
  job_id?: string;
  customer_id: string;
  worker_id: string;
  profiles_customer: {
    id: string;
    full_name: string;
    avatar_url: string;
  }[]; // Changed to array
  profiles_worker: {
    id: string;
    full_name: string;
    avatar_url: string;
  }[]; // Changed to array
  jobs?: {
    title: string;
    location: string;
  }[]; // Changed to array
  messages: Message[];
}

export default function MessageThreadPage() {
  const router = useRouter();
  const { id } = useParams();
  const conversationId = Array.isArray(id) ? id[0] : id;

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchConversationData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/auth/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setCurrentUser(profile as UserProfile);

        if (!conversationId) {
          setError('Conversation ID is missing.');
          setLoading(false);
          return;
        }

        const { data: fetchedConversation, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            job_id,
            customer_id,
            worker_id,
            profiles_customer:customer_id (id, full_name, avatar_url),
            profiles_worker:worker_id (id, full_name, avatar_url),
            jobs (title, location),
            messages (id, created_at, sender_id, text)
          `)
          .eq('id', conversationId)
          .single();

        if (convError) {
          throw convError;
        }

        if (!fetchedConversation) {
          setError('Conversation not found.');
          setLoading(false);
          return;
        }

        // Explicitly cast nested objects to ensure correct types
        const conversationData: ConversationDetail = {
          ...fetchedConversation,
          profiles_customer: fetchedConversation.profiles_customer as { id: string; full_name: string; avatar_url: string; }[],
          profiles_worker: fetchedConversation.profiles_worker as { id: string; full_name: string; avatar_url: string; }[],
          jobs: fetchedConversation.jobs as { title: string; location: string; }[],
          messages: fetchedConversation.messages as Message[],
        };

        // Sort messages by created_at
        conversationData.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        setConversation(conversationData);
      } catch (err: any) {
        console.error('Error fetching conversation data:', err);
        setError(err.message || 'Failed to load conversation.');
        router.push('/messages'); // Redirect to messages list on error
      } finally {
        setLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId, router, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleBack = () => router.push('/messages'); // Go back to messages list

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !conversation) return;

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          text: newMessage.trim(),
        });

      if (insertError) throw insertError;

      setNewMessage('');
      router.refresh(); // Re-fetch data to show new message
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button onClick={handleBack} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go Back to Messages
        </button>
      </div>
    );
  }

  if (!currentUser || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Conversation not found or user not logged in.</p>
        <button onClick={handleBack} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go Back to Messages
        </button>
      </div>
    );
  }

  const otherUser =
    currentUser.id === conversation.customer_id
      ? conversation.profiles_worker[0]
      : conversation.profiles_customer[0];

  if (!otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Other participant not found.</p>
        <button onClick={handleBack} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go Back to Messages
        </button>
      </div>
    );
  }

  const isWorker = currentUser.role === 'worker';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={handleBack} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <img src={otherUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.full_name || 'User')}&background=4F46E5&color=fff`} alt={otherUser.full_name} className="w-10 h-10 rounded-full border-2 border-blue-500" />
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white">{otherUser.full_name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isWorker ? 'Homeowner' : 'Worker'} • {conversation.jobs?.[0]?.location || 'N/A'}
              </p>
            </div>
          </div>

          <div className="ml-auto hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Chat */}
      <main className="flex-grow container mx-auto px-4 py-4 flex flex-col">
        {conversation.jobs?.[0]?.title && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              About job: <span className="font-bold">{conversation.jobs[0].title}</span>
            </p>
          </div>
        )}

        <div className="flex-grow overflow-y-auto pb-4 space-y-4">
          {conversation.messages.map((msg) => {
            const isOwn = msg.sender_id === currentUser.id;
            const sender =
              msg.sender_id === conversation.customer_id
                ? conversation.profiles_customer[0]
                : conversation.profiles_worker[0];

            if (!sender) return null; // Should not happen if data is consistent

            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
                }`}>
                  {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <img src={sender.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.full_name || 'User')}&background=4F46E5&color=fff`} alt={sender.full_name} className="w-6 h-6 rounded-full" />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{sender.full_name}</span>
                    </div>
                  )}
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
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
              disabled={!newMessage.trim() || loading}
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
