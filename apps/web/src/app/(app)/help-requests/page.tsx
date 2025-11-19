// app/help-requests/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Users, CheckCircle, MessageSquare, Send, X } from 'lucide-react';

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  budget?: string;
  deadline?: string;
  createdAt: string;
  createdBy: string; // email
  responders?: string[]; // emails of workers who said they're available
}

interface Conversation {
  id: string;
  created_at: string;
  requester_email: string; // email of the person who created the help request
  responder_email: string; // email of the worker responding
  help_request_id: string;
  help_request_title: string;
  last_message_text?: string;
}

// Mock help requests used for local testing when localStorage is empty
const MOCK_HELP_REQUESTS: HelpRequest[] = [
  {
    id: 'req-1',
    title: 'Need help with bathroom tiling',
    description: 'Small bathroom (2m x 2m). Need tiles removed and new tiles laid. Flexible schedule this weekend.',
    skills: ['tiling', 'waterproofing'],
    location: 'Centurion, Pretoria',
    budget: 'ZAR 1500',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdBy: 'homeowner@test.com',
    responders: [],
  },
  {
    id: 'req-2',
    title: 'Lawn mower needed for one day',
    description: 'Backyard is overgrown; needs a quick mow and trimming. Bring own tools.',
    skills: ['garden', 'lawn-care'],
    location: 'Sunnyside, Pretoria',
    budget: 'ZAR 300',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'company@test.com',
    responders: ['worker@test.com'],
  },
  {
    id: 'req-3',
    title: 'Help installing a ceiling fan',
    description: 'Ceiling fan purchased; need someone experienced to install safely.',
    skills: ['electrical'],
    location: 'Hatfield, Pretoria',
    budget: 'ZAR 450',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdBy: 'homeowner@test.com',
    responders: [],
  },
];

export default function HelpRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isWorker, setIsWorker] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [initialMessage, setInitialMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    // Simple mock: treat 'worker@test.com' as worker; expand as needed
    const workerEmails = ['worker@test.com'];
    setIsWorker(Boolean(email && workerEmails.includes(email)));

    const raw = localStorage.getItem('helpRequests');
    if (raw) {
      try {
        const parsed: HelpRequest[] = JSON.parse(raw);
        // ensure responders arrays exist
        const normalized = parsed.map(r => ({ ...r, responders: r.responders || [] }));
        setRequests(normalized.reverse());
      } catch (e) {
        console.warn('Invalid helpRequests in localStorage');
        setRequests([]);
      }
    } else {
      // Seed example requests for local development when none exist
      try {
        localStorage.setItem('helpRequests', JSON.stringify(MOCK_HELP_REQUESTS));
        setRequests(MOCK_HELP_REQUESTS.slice().reverse());
      } catch (e) {
        console.warn('Failed to seed mock help requests', e);
        setRequests([]);
      }
    }

    setLoading(false);
  }, []);

  const updateLocalRequests = (updated: HelpRequest[]) => {
    // persist in same order as saved (oldest first)
    localStorage.setItem('helpRequests', JSON.stringify([...updated].reverse()));
  };

  const markAvailable = (id: string) => {
    if (!userEmail) {
      setMessage('Please login to mark availability.');
      return;
    }

    setRequests(prev => {
      const next = prev.map(r => {
        if (r.id === id) {
          const responders = new Set(r.responders || []);
          responders.add(userEmail);
          return { ...r, responders: Array.from(responders) };
        }
        return r;
      });
      updateLocalRequests(next.slice().reverse());
      setMessage('You have marked yourself as available.');
      return next;
    });
  };

  const openMessageModal = (request: HelpRequest) => {
    setSelectedRequest(request);
    setInitialMessage(`I'm interested in helping with: ${request.title}`);
    setShowMessageModal(true);
  };

  const createConversationAndNavigate = () => {
    if (!userEmail || !selectedRequest) {
      setMessage('Please login to start a conversation.');
      return;
    }

    if (!initialMessage.trim()) {
      setMessage('Please write a message before sending.');
      return;
    }

    // Create a new conversation
    const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newConversation: Conversation = {
      id: convId,
      created_at: new Date().toISOString(),
      requester_email: selectedRequest.createdBy,
      responder_email: userEmail,
      help_request_id: selectedRequest.id,
      help_request_title: selectedRequest.title,
      last_message_text: initialMessage,
    };

    // Create initial message
    interface Message {
      id: string;
      created_at: string;
      conversation_id: string;
      sender_email: string;
      text: string;
    }

    const initialMsgObj: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      created_at: new Date().toISOString(),
      conversation_id: convId,
      sender_email: userEmail,
      text: initialMessage,
    };

    // Load existing conversations and messages
    const rawConvs = localStorage.getItem('conversations');
    let conversations: Conversation[] = [];
    if (rawConvs) {
      try {
        conversations = JSON.parse(rawConvs);
      } catch (e) {
        console.warn('Invalid conversations in localStorage');
      }
    }

    const rawMsgs = localStorage.getItem('help_request_messages');
    let messages: Message[] = [];
    if (rawMsgs) {
      try {
        messages = JSON.parse(rawMsgs);
      } catch (e) {
        console.warn('Invalid messages in localStorage');
      }
    }

    // Add new conversation and message
    conversations.push(newConversation);
    messages.push(initialMsgObj);
    localStorage.setItem('conversations', JSON.stringify(conversations));
    localStorage.setItem('help_request_messages', JSON.stringify(messages));

    setShowMessageModal(false);
    setInitialMessage('');
    setSelectedRequest(null);

    // Navigate to the new conversation
    router.push(`/messages/${convId}`);
  };

  if (loading) return <div className="p-8">Loading…</div>;

  if (!isWorker) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">Brinkify SA</Link>
            <div className="hidden md:block"><ModeToggle /></div>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Help Requests Board</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">This board is for workers to browse requests and offer help. Please log in as a worker to participate.</p>
            <div className="flex justify-center gap-3">
              <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Log in</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">Sign up</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-bold">Help Requests</span>
          </Link>
          <div className="hidden md:block"><ModeToggle /></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Requests from other workers</h3>
          <Link href="/request-help" className="text-sm text-blue-600 hover:underline">Create request</Link>
        </div>

        {message && <div className="mb-4 text-sm text-green-700 dark:text-green-300">{message}</div>}

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600">No requests yet. Check back later or create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="max-w-lg">
                    <h4 className="font-bold text-lg">{r.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.description}</p>
                    <div className="flex gap-2 text-xs text-gray-500 mt-2">
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">{r.location}</span>
                      {r.skills.length > 0 && <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">{r.skills.join(', ')}</span>}
                      {r.budget && <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">Budget: {r.budget}</span>}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{new Date(r.createdAt).toLocaleString()}</div>
                    <div className="mt-2">From: <span className="font-medium">{r.createdBy}</span></div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Responders: <span className="font-medium">{(r.responders || []).length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => markAvailable(r.id)} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">I'm available</button>
                    <button onClick={() => openMessageModal(r)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Send a Message</h3>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedRequest(null);
                  setInitialMessage('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedRequest && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">{selectedRequest.title}</p>
              </div>
            )}

            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Type your message..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedRequest(null);
                  setInitialMessage('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={createConversationAndNavigate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


