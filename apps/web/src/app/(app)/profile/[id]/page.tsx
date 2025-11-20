'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import {
  MapPin,
  Star,
  MessageCircle,
  ArrowLeft,
  Link as LinkIcon,
} from 'lucide-react';
import Loader from '@/components/loader'; // Assuming a Loader component exists

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  location: string;
  role: 'worker' | 'customer' | 'company';
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  average_rating?: number;
  portfolio?: string[]; // Array of public URLs
  reviews_count?: number; // To store the count of reviews
}

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [worker, setWorker] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock workers data
  const mockWorkers: { [key: string]: UserProfile } = {
    '2': {
      id: '2',
      full_name: 'Sarah Worker',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      location: 'Cape Town, SA',
      role: 'worker',
      bio: 'Experienced electrician with 8+ years in residential and commercial wiring. Fully compliant with SANS standards.',
      skills: ['Electrical Wiring', 'LED Installation', 'Circuit Breaker Repair', 'Solar Panel Wiring'],
      hourly_rate: 350,
      average_rating: 4.8,
      portfolio: [
        'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      ],
      reviews_count: 24,
    },
    '3': {
      id: '3',
      full_name: 'Mike Electrician',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      location: 'Johannesburg, SA',
      role: 'worker',
      bio: 'Licensed electrician specializing in home renovations and repairs. Fast, reliable, and professional.',
      skills: ['Electrical Repairs', 'Wiring', 'Fixture Installation', 'Troubleshooting'],
      hourly_rate: 300,
      average_rating: 4.6,
      portfolio: [
        'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600',
      ],
      reviews_count: 18,
    },
    '4': {
      id: '4',
      full_name: 'Thabo N.',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo',
      location: 'Pretoria, SA',
      role: 'worker',
      bio: 'Master plumber with 12 years of experience. Specialized in pipe installation and repairs.',
      skills: ['Plumbing', 'Pipe Installation', 'Leak Repair', 'Drain Cleaning'],
      hourly_rate: 280,
      average_rating: 4.9,
      portfolio: [
        'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
      ],
      reviews_count: 32,
    },
  };

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileId = params?.id as string;
        if (!profileId) {
          setError('Profile ID is missing.');
          setLoading(false);
          return;
        }

        // Get mock worker data
        const profile = mockWorkers[profileId];

        if (!profile) {
          setError('Worker profile not found.');
          setLoading(false);
          return;
        }

        setWorker(profile as UserProfile);
      } catch (err: any) {
        console.error('Error loading worker profile:', err);
        setError(err.message || 'Failed to load worker profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerProfile();
  }, [params?.id]);

  const handleBack = () => router.back();
  const handleContact = () => {
    if (!worker) return;

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert('Please log in to contact a worker');
      router.push('/auth/login');
      return;
    }

    // Create a conversation id and initial message
    const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const initialMsg = `Hi ${worker.full_name}, I'm interested in your services. Can we discuss availability and pricing?`;

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
      created_at: string;
      conversation_id: string;
      sender_email: string;
      text: string;
    }

    const newConversation: HelpRequestConversation = {
      id: convId,
      created_at: new Date().toISOString(),
      requester_email: userEmail,
      responder_email: worker.id,
      help_request_id: worker.id,
      help_request_title: worker.full_name,
      last_message_text: initialMsg,
    };

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      created_at: new Date().toISOString(),
      conversation_id: convId,
      sender_email: userEmail,
      text: initialMsg,
    };

    // Load existing conversations/messages from localStorage
    try {
      const rawConvs = localStorage.getItem('conversations');
      let conversations: HelpRequestConversation[] = [];
      if (rawConvs) {
        try { conversations = JSON.parse(rawConvs); } catch { conversations = []; }
      }

      const rawMsgs = localStorage.getItem('help_request_messages');
      let messages: Message[] = [];
      if (rawMsgs) {
        try { messages = JSON.parse(rawMsgs); } catch { messages = []; }
      }

      conversations.push(newConversation);
      messages.push(newMsg);

      localStorage.setItem('conversations', JSON.stringify(conversations));
      localStorage.setItem('help_request_messages', JSON.stringify(messages));
    } catch (err) {
      console.warn('Failed to save conversation to localStorage', err);
    }

    // Navigate to the messages page for this conversation
    router.push(`/messages/${convId}`);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button onClick={handleBack} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Worker profile not found.</p>
        <button onClick={handleBack} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white md:hidden">
            Worker Profile
          </h1>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img
                src={worker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.full_name || 'User')}&background=4F46E5&color=fff`}
                alt={worker.full_name}
                className="w-24 h-24 rounded-full border-4 border-blue-200 dark:border-blue-800"
              />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold">{worker.full_name}</h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-400 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{worker.location}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">{worker.average_rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-500">
                    ({worker.reviews_count || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center sm:justify-end">
              <button
                onClick={handleContact}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contact
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-3">About</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {worker.bio || 'No bio provided.'}
            </p>
          </div>

          {/* Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-400">
                  Hourly Rate
                </h3>
                <p className="font-bold text-lg">R {worker.hourly_rate || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-400">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(worker.skills && worker.skills.length > 0) ? (
                    worker.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No skills listed.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Portfolio</h2>
            <div className="space-y-4">
              {(worker.portfolio && worker.portfolio.length > 0) ? (
                worker.portfolio.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <LinkIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {/* Extract filename or use a generic title */}
                      {url.split('/').pop() || `Portfolio Item ${i + 1}`}
                    </span>
                  </a>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No portfolio items yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
