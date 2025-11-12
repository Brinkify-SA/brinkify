// app/messages/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { ArrowLeft, Send } from 'lucide-react';

// 🔒 Mock current user — toggle this to test both roles
const MOCK_CURRENT_USER = {
  id: 'user_456', // ← Change to 'user_123' for worker
  name: 'Sarah K.',
  role: 'customer', // ← 'worker' or 'customer'
  avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=10B981&color=fff',
};

// 📋 Generate mock conversations dynamically
function getMockConversations(currentUser: typeof MOCK_CURRENT_USER) {
  if (currentUser.role === 'worker') {
    return {
      conv_001: {
        id: 'conv_001',
        participants: [
          currentUser,
          { id: 'user_456', name: 'Sarah K.', role: 'customer', avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=10B981&color=fff' },
        ],
        job: { id: 'job_002', title: 'Install ceiling fan', location: 'Johannesburg, Sandton' },
        messages: [
          { id: 'm1', senderId: 'user_456', text: 'Hi Thabo! Are you available to install a ceiling fan this weekend?', timestamp: '2025-10-25T10:00:00' },
          { id: 'm2', senderId: 'user_123', text: 'Hi Sarah! Yes, I’m available on Saturday morning.', timestamp: '2025-10-25T10:05:00' },
        ],
      },
    };
  } else {
    return {
      conv_001: {
        id: 'conv_001',
        participants: [
          currentUser,
          { id: 'user_123', name: 'Thabo N.', role: 'worker', avatar: 'https://ui-avatars.com/api/?name=Thabo+N&background=4F46E5&color=fff' },
        ],
        job: { id: 'job_002', title: 'Install ceiling fan', location: 'Johannesburg, Sandton' },
        messages: [
          { id: 'm1', senderId: 'user_456', text: 'Hi Thabo! Are you available to install a ceiling fan this weekend?', timestamp: '2025-10-25T10:00:00' },
          { id: 'm2', senderId: 'user_123', text: 'Hi Sarah! Yes, I’m available on Saturday morning.', timestamp: '2025-10-25T10:05:00' },
        ],
      },
    };
  }
}

export default function MessageThreadPage() {
  const router = useRouter();
  const { id } = useParams();
  const conversationId = Array.isArray(id) ? id[0] : id;

  const [currentUser, setCurrentUser] = useState<typeof MOCK_CURRENT_USER | null>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(MOCK_CURRENT_USER);
    const conversations = getMockConversations(MOCK_CURRENT_USER);
    
    if (
      conversationId &&
      Object.prototype.hasOwnProperty.call(conversations, conversationId)
    ) {
      setConversation(conversations[conversationId as keyof typeof conversations]);
    } else {
      router.push('/messages');
    }
  }, [conversationId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleBack = () => router.push('/dashboard');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const mockMessage = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setConversation((prev: any) => ({
      ...prev,
      messages: [...prev.messages, mockMessage],
    }));
    setNewMessage('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (!currentUser || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">
          {conversation === null ? 'Conversation not found' : 'Loading...'}
        </p>
      </div>
    );
  }

  const otherUser = conversation.participants.find((p: any) => p.id !== currentUser.id);
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
            <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full border-2 border-blue-500" />
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white">{otherUser.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isWorker ? 'Homeowner' : 'Worker'} • {conversation.job.location}
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
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            About job: <span className="font-bold">{conversation.job.title}</span>
          </p>
        </div>

        <div className="flex-grow overflow-y-auto pb-4 space-y-4">
          {conversation.messages.map((msg: any) => {
            const isOwn = msg.senderId === currentUser.id;
            const sender = conversation.participants.find((p: any) => p.id === msg.senderId);
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
                }`}>
                  {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <img src={sender.avatar} alt={sender.name} className="w-6 h-6 rounded-full" />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{sender.name}</span>
                    </div>
                  )}
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
