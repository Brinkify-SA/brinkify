// app/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { MessageSquare, MapPin, Briefcase, Home, ArrowLeft, Trash2 } from 'lucide-react';
import Loader from '@/components/loader'; // Assuming a Loader component exists

interface UserProfile {
  id: string;
  full_name: string;
  role: 'worker' | 'customer' | 'company';
  avatar_url: string;
}

interface Conversation {
  id: string;
  created_at: string;
  job_id?: string;
  customer_id: string;
  worker_id: string;
  profiles_customer: {
    id: string;
    full_name: string;
    avatar_url: string;
  } | null; // Can be null if not found
  profiles_worker: {
    id: string;
    full_name: string;
    avatar_url: string;
  } | null; // Can be null if not found
  jobs?: {
    title: string;
    location: string;
  } | null; // Can be null if no job associated
  last_message_text?: string; // To store the last message text
  unread_by_user?: boolean; // To indicate if there are unread messages for the current user
}

// Conversation from help requests (worker-initiated)
interface HelpRequestConversation {
  id: string;
  created_at: string;
  requester_email: string;
  responder_email: string;
  help_request_id: string;
  help_request_title: string;
  last_message_text?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [helpConversations, setHelpConversations] = useState<HelpRequestConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchUserDataAndConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mock user data
        const mockUsers: { [key: string]: UserProfile } = {
          '1': {
            id: '1',
            full_name: 'John Homeowner',
            role: 'customer',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          },
          '2': {
            id: '2',
            full_name: 'Sarah Worker',
            role: 'worker',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          },
        };

        // Get logged-in user
        const storedEmail = localStorage.getItem('userEmail') || 'homeowner@test.com';
        const userId = storedEmail.includes('worker') ? '2' : '1';
        const profile = mockUsers[userId];

        setUser(profile as UserProfile);

        // Mock conversations
        const mockConversations: Conversation[] = [
          {
            id: 'conv1',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            job_id: '1',
            customer_id: '1',
            worker_id: '2',
            profiles_customer: {
              id: '1',
              full_name: 'John Homeowner',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            },
            profiles_worker: {
              id: '2',
              full_name: 'Sarah Worker',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            },
            jobs: {
              title: 'Kitchen Renovation',
              location: 'Johannesburg, SA',
            },
            last_message_text: 'When can you start the kitchen renovation?',
            unread_by_user: false,
          },
          {
            id: 'conv2',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            job_id: '2',
            customer_id: '1',
            worker_id: '3',
            profiles_customer: {
              id: '1',
              full_name: 'John Homeowner',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            },
            profiles_worker: {
              id: '3',
              full_name: 'Mike Electrician',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            },
            jobs: {
              title: 'Electrical Wiring Installation',
              location: 'Johannesburg, SA',
            },
            last_message_text: 'Thanks for the job. I\\ll bring my tools tomorrow.',
            unread_by_user: true,
          },
        ];

        // Filter conversations based on user role
        const userConversations = mockConversations.filter(
          conv => conv.customer_id === userId || conv.worker_id === userId
        );

        setConversations(userConversations);

        // Load help-request conversations from localStorage
        const rawHelpConvs = localStorage.getItem('conversations');
        if (rawHelpConvs) {
          try {
            const helpConvs: HelpRequestConversation[] = JSON.parse(rawHelpConvs);
            // Filter to conversations involving current user
            const userHelpConvs = helpConvs.filter(
              conv => conv.requester_email === storedEmail || conv.responder_email === storedEmail
            );
            setHelpConversations(userHelpConvs);
          } catch (e) {
            console.warn('Failed to load help request conversations', e);
          }
        }
      } catch (err: any) {
        console.error('Error loading conversations:', err);
        setError(err.message || 'Failed to load messages.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndConversations();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/auth/login');
  };

  const deleteHelpConversation = (convId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      // Remove from conversations
      const rawConvs = localStorage.getItem('conversations');
      if (rawConvs) {
        const convs: HelpRequestConversation[] = JSON.parse(rawConvs);
        const filtered = convs.filter((c) => c.id !== convId);
        localStorage.setItem('conversations', JSON.stringify(filtered));
      }

      // Remove messages
      const rawMsgs = localStorage.getItem('help_request_messages');
      if (rawMsgs) {
        const msgs: any[] = JSON.parse(rawMsgs);
        const filtered = msgs.filter((m) => m.conversation_id !== convId);
        localStorage.setItem('help_request_messages', JSON.stringify(filtered));
      }

      // Refresh page
      window.location.reload();
    } catch (err: any) {
      console.error('Error deleting conversation:', err);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button onClick={() => router.push('/dashboard')} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">No user data found. Please log in.</p>
        <button onClick={() => router.push('/auth/login')} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go to Login
        </button>
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
              const otherUser =
                user.id === conv.customer_id ? conv.profiles_worker : conv.profiles_customer;
              const jobTitle = conv.jobs?.title || 'General Chat';
              const jobLocation = conv.jobs?.location || '';

              if (!otherUser) return null; // Handle case where otherUser might be null

              return (
                <Link key={conv.id} href={`/messages/${conv.id}`} className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                  <div className="flex gap-3">
                    <div className="relative">
                      <img src={otherUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.full_name || 'User')}&background=4F46E5&color=fff`} alt={otherUser.full_name} className="w-12 h-12 rounded-full" />
                      {conv.unread_by_user && <span className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h2 className="font-bold text-gray-800 dark:text-white truncate">{otherUser.full_name}</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(conv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {conv.job_id ? <Briefcase className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                        <span>{jobTitle}</span>
                        {jobLocation && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{jobLocation}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-1">{conv.last_message_text}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {helpConversations.length > 0 && user?.role === 'worker' && (
          <>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Help Request Messages</h3>
            </div>
            <div className="space-y-4">
              {helpConversations.map((conv) => {
                const otherEmail = conv.requester_email === (localStorage.getItem('userEmail') || 'homeowner@test.com') 
                  ? conv.responder_email 
                  : conv.requester_email;
                const otherName = otherEmail === 'homeowner@test.com' ? 'John Homeowner' : otherEmail === 'worker@test.com' ? 'Sarah Worker' : otherEmail;
                const otherAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherName.split(' ')[0]}`;

                return (
                  <div key={conv.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition flex items-center">
                    <Link href={`/messages/${conv.id}`} className="block flex-1 p-4">
                      <div className="flex gap-3">
                        <div className="relative">
                          <img src={otherAvatar} alt={otherName} className="w-12 h-12 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h2 className="font-bold text-gray-800 dark:text-white truncate">{otherName}</h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {new Date(conv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <MessageSquare className="w-3 h-3" />
                            <span>{conv.help_request_title}</span>
                          </div>
                          <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-1">{conv.last_message_text}</p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        deleteHelpConversation(conv.id);
                      }}
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
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
