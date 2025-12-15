'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Briefcase,
  MapPin,
  Star,
  User,
  Calendar,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import Loader from '@/components/loader';

interface UserProfile {
  id: string;
  full_name: string;
  role: 'worker' | 'customer' | 'company';
}

interface Job {
  id: string;
  title: string;
  description?: string;
  location: string;
  min_budget?: number;
  max_budget?: number;
  created_at: string;
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  customer_id: string;
  worker_id?: string;
  profiles_customer?: { full_name: string }[];
  profiles_worker?: { full_name: string }[];
  reviews?: { rating: number }[];
}

export default function MyJobsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentJobs, setCurrentJobs] = useState<Job[]>([]);
  const [jobHistory, setJobHistory] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/user-jobs', { credentials: 'include' });

        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }

        if (!res.ok) throw new Error('Failed to load jobs');

        const jobs: Job[] = await res.json();

        setCurrentJobs(jobs.filter(j => j.status !== 'completed'));
        setJobHistory(jobs.filter(j => j.status === 'completed'));

        // TEMP user until auth profile endpoint is wired
        setUser({ id: 'me', full_name: 'User', role: 'customer' });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [router]);

  const markFinished = async (jobId: string) => {
    // Optional: hook this to an API later
    setCurrentJobs(prev => prev.filter(j => j.id !== jobId));
    const finished = currentJobs.find(j => j.id === jobId);
    if (finished) {
      setJobHistory(prev => [{ ...finished, status: 'completed' }, ...prev]);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!user) return null;

  const isWorker = user.role === 'worker';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 shadow sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1 text-blue-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </button>
          <ModeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          {isWorker ? 'My Jobs' : 'My Posted Jobs'}
        </h1>

        {/* Current Jobs */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-white">Ongoing Jobs</h2>

          {currentJobs.length ? (
            currentJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                type="current"
                isWorker={isWorker}
                onViewDetails={() => router.push(`/jobs/${job.id}`)}
                onMarkFinished={() => markFinished(job.id)}
              />
            ))
          ) : (
            <EmptyCard icon={Briefcase} text="No ongoing jobs" />
          )}
        </section>

        {/* History */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-white">Job History</h2>

          {jobHistory.length ? (
            jobHistory.map(job => (
              <JobCard
                key={job.id}
                job={job}
                type="history"
                isWorker={isWorker}
                onViewDetails={() => router.push(`/jobs/${job.id}`)}
              />
            ))
          ) : (
            <EmptyCard icon={Calendar} text="No completed jobs yet" />
          )}
        </section>
      </main>
    </div>
  );
}

/* ---------------- Components ---------------- */

function EmptyCard({ icon: Icon, text }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center border">
      <Icon className="mx-auto w-10 h-10 text-gray-400 mb-3" />
      <p className="text-gray-500">{text}</p>
    </div>
  );
}

function JobCard({
  job,
  type,
  isWorker,
  onViewDetails,
  onMarkFinished,
}: {
  job: Job;
  type: 'current' | 'history';
  isWorker: boolean;
  onViewDetails: () => void;
  onMarkFinished?: () => void;
}) {
  const otherParty = isWorker
    ? job.profiles_customer?.[0]?.full_name
    : job.profiles_worker?.[0]?.full_name;

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border mb-4">
      <div className="flex justify-between">
        <h3 className="font-bold text-lg">{job.title}</h3>
        {type === 'history' && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>—</span>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 mt-2">
        {otherParty && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {otherParty}
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <span className="font-semibold">
          {job.min_budget && job.max_budget
            ? `ZAR ${job.min_budget} - ${job.max_budget}`
            : '—'}
        </span>

        <div className="flex gap-3">
          {type === 'current' && isWorker && onMarkFinished && (
            <button
              onClick={onMarkFinished}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Finish
            </button>
          )}
          <button
            onClick={onViewDetails}
            className="text-blue-600 hover:underline text-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
