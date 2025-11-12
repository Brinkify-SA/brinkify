// app/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { MessageSquare, MapPin, Briefcase, Home } from 'lucide-react';

// 🔒 Mock current user — toggle between 'worker' and 'customer' to test
const MOCK_CURRENT_USER = {
  id: 'user_456', // ← Changed to customer ID for testing
  name: 'Sarah K.',
  role: 'worker', // ← Try 'worker' or 'customer'
  avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=10B981&color=fff',
};

// 📋 Generate mock conversations dynamically based on current user
function generateMockConversations(currentUser: typeof MOCK_CURRENT_USER) {
  if (currentUser.role === 'customer') {
    // Worker sees conversations with customers
    return [
      {
        id: 'conv_001',
        participants: [
          currentUser,
          { id: 'user_456', name: 'Sarah K.', role: 'customer', avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=10B981&color=fff' },
        ],
        job: { title: 'Install ceiling fan', location: 'Johannesburg, Sandton' },
        lastMessage: 'Perfect! I’ll bring my tools and be there by 9:15 AM.',
        timestamp: '2025-10-25T10:12:00',
        unread: false,
      },
      {
        id: 'conv_002',
        participants: [
          currentUser,
          { id: 'user_789', name: 'David M.', role: 'customer', avatar: 'https://ui-avatars.com/api/?name=David+M&background=8B5CF6&color=fff' },
        ],
        job: { title: 'Fix kitchen light', location: 'Pretoria, Centurion' },
        lastMessage: 'Can you come tomorrow at 2 PM?',
        timestamp: '2025-10-26T09:30:00',
        unread: true,
      },
    ];
  } else {
    // Customer sees conversations with workers
    return [
      {
        id: 'conv_001',
        participants: [
          currentUser,
          { id: 'user_123', name: 'Thabo N.', role: 'worker', avatar: 'https://ui-avatars.com/api/?name=Thabo+N&background=4F46E5&color=fff' },
        ],
        job: { title: 'Install ceiling fan', location: 'Johannesburg, Sandton' },
        lastMessage: 'Hi Sarah! Yes, I’m available on Saturday morning.',
        timestamp: '2025-10-25T10:05:00',
        unread: false,
      },
      {
        id: 'conv_003',
        participants: [
          currentUser,
          { id: 'user_101', name: 'Lerato P.', role: 'worker', avatar: 'https://ui-avatars.com/api/?name=Lerato+P&background=F59E0B&color=fff' },
        ],
        job: { title: 'Garden cleanup', location: 'Durban, Umhlanga' },
        lastMessage: 'I can start tomorrow at 8 AM if that works.',
        timestamp: '2025-10-26T08:15:00',
        unread: true,
      },
    ];
  }
}

export default function MessagesPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<typeof MOCK_CURRENT_USER | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    setUser(MOCK_CURRENT_USER);
    setConversations(generateMockConversations(MOCK_CURRENT_USER));
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
     router.push(path as any);
  };

  const handleLogout = () => {
    router.push('/auth/login');
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  const isWorker = user.role === 'worker';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={handleBack} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">Messages</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white md:hidden">Messages</h1>
          <div className="hidden md:block"><ModeToggle /></div>
          <button onClick={toggleMenu} className="md:hidden text-blue-600 dark:text-blue-400 focus:outline-none" aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={toggleMenu}></div>
          <div className="absolute left-0 top-0 h-full w-3/4 bg-blue-600 text-white p-6 pt-16">
            <button onClick={toggleMenu} className="absolute top-4 right-4 text-white" aria-label="Close menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="flex flex-col space-y-4 mt-6">
              <button onClick={() => navigate('/')} className="text-left text-lg font-medium">Home</button>
              <button onClick={() => navigate('/explore')} className="text-left text-lg font-medium">Explore</button>
              <button onClick={() => navigate('/about')} className="text-left text-lg font-medium">About Us</button>
              <button onClick={handleLogout} className="text-left text-lg font-medium">Log Out</button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Messages</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isWorker ? 'Your conversations with homeowners' : 'Your conversations with workers'}
            </p>
          </div>
          {!isWorker && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              New Message
            </button>
          )}
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No conversations yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isWorker
                ? 'You’ll see messages here when homeowners contact you.'
                : 'Start a job to connect with skilled workers.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => {
              // ✅ Always pick the OTHER user (not current user)
              const otherUser = conv.participants.find((p: any) => p.id !== user.id);
              return (
                <Link key={conv.id} href={`/messages/${conv.id}`} className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                  <div className="flex gap-3">
                    <div className="relative">
                      <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full" />
                      {conv.unread && <span className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h2 className="font-bold text-gray-800 dark:text-white truncate">{otherUser.name}</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(conv.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {isWorker ? <Home className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                        <span>{conv.job.title}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span>{conv.job.location}</span>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-1">{conv.lastMessage}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-6 text-center">
        <div className="container mx-auto px-4">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Brinkify SA</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            © {new Date().getFullYear()} Connecting skilled workers with homeowners across South Africa.
          </p>
        </div>
      </footer>
    </div>
  );
}
