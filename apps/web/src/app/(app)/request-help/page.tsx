// app/request-help/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Users, MapPin } from 'lucide-react';

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
}

export default function RequestHelpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isWorker, setIsWorker] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);

  useEffect(() => {
    setLoading(true);
    // Determine mock role from stored email
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    // Simple mapping: only 'worker@test.com' is treated as a worker in mock data
    const workerEmails = ['worker@test.com'];
    if (email && workerEmails.includes(email)) {
      setIsWorker(true);
    } else {
      setIsWorker(false);
    }

    // Load existing requests from localStorage
    const raw = localStorage.getItem('helpRequests');
    if (raw) {
      try {
        const parsed: HelpRequest[] = JSON.parse(raw);
        setRequests(parsed.reverse());
      } catch (e) {
        console.warn('Invalid helpRequests in localStorage');
      }
    }

    setLoading(false);
  }, []);

  const saveRequest = (req: HelpRequest) => {
    const raw = localStorage.getItem('helpRequests');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(req);
    localStorage.setItem('helpRequests', JSON.stringify(arr));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isWorker) {
      setMessage({ type: 'error', text: 'Only workers can request help.' });
      return;
    }

    if (!title.trim() || !description.trim()) {
      setMessage({ type: 'error', text: 'Please provide a title and description.' });
      return;
    }

    const req: HelpRequest = {
      id: String(Date.now()),
      title: title.trim(),
      description: description.trim(),
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      location: location || 'Not specified',
      budget: budget || undefined,
      deadline: deadline || undefined,
      createdAt: new Date().toISOString(),
      createdBy: userEmail || 'unknown',
    };

    try {
      saveRequest(req);
      setRequests(prev => [req, ...prev]);
      setTitle(''); setDescription(''); setSkills(''); setLocation(''); setBudget(''); setDeadline('');
      setMessage({ type: 'success', text: 'Help request created — other workers will see it.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to create request.' });
    }
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
            <h2 className="text-2xl font-bold mb-2">Request Help</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">This feature is available to registered workers only.</p>
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
            <span className="font-bold">Request Help</span>
          </Link>
          <div className="hidden md:block"><ModeToggle /></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-xl font-bold mb-2">Create a Help Request</h3>
          {message && (
            <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-red-100 text-red-800 dark:bg-red-900/30'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800" placeholder="Short summary: e.g. Need tiler for bathroom job" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800" placeholder="Describe the task and what help you need" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800" placeholder="e.g. Cape Town, Southern Suburbs" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Budget (optional)</label>
                <input value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800" placeholder="e.g. ZAR 1500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skills needed (comma separated)</label>
                <input value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800" placeholder="tiling, waterproofing" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deadline (optional)</label>
                <input aria-label="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Post Request</button>
              <button type="button" onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Recent Help Requests</h3>
          {requests.length === 0 ? (
            <p className="text-gray-600">No requests yet.</p>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{r.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{r.description}</p>
                    <div className="flex gap-2 items-center text-xs text-gray-500 mt-2">
                      <MapPin className="w-3 h-3" /> <span>{r.location}</span>
                      {r.skills.length > 0 && (<><span>•</span><span>{r.skills.join(', ')}</span></>)}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{new Date(r.createdAt).toLocaleString()}</div>
                    <div className="mt-2">From: <span className="font-medium">{r.createdBy}</span></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
