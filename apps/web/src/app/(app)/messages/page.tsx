// app/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { MessageSquare, MapPin, Briefcase, Home, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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

export default function MessagesPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserDataAndConversations = async () => {
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

        setUser(profile as UserProfile);

        // Fetch conversations where the current user is either customer or worker
        const { data: fetchedConversations, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            job_id,
            customer_id,
            worker_id,
            profiles_customer:customer_id (id, full_name, avatar_url),
            profiles_worker:worker_id (id, full_name, avatar_url),
            jobs (title, location)
          `)
          .or(`customer_id.eq.${profile.id},worker_id.eq.${profile.id}`)
          .order('created_at', { ascending: false });

        if (convError) throw convError;

        // For each conversation, fetch the last message and check for unread status
        const conversationsWithLastMessage = await Promise.all(
          fetchedConversations.map(async (conv: any) => { // Use 'any' temporarily for mapping
            const { data: lastMessage, error: msgError } = await supabase
              .from('messages')
              .select('text, created_at')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (msgError && msgError.code !== 'PGRST116') { // PGRST116 means no rows found
              console.error('Error fetching last message:', msgError);
            }

            // Implement unread logic if needed (requires a 'read' status on messages or similar)
            // For now, we'll just add the last message text
            return {
              ...conv,
              last_message_text: lastMessage?.text || 'No messages yet.',
              // unread_by_user: ... (logic to determine unread status)
            };
          })
        );

        setConversations(conversationsWithLastMessage);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load messages.');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndConversations();
  }, [router, supabase]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
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
