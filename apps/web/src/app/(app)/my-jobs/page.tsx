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

// 🔁 Updated to match your Supabase API response
interface Job {
  id: string;
  title: string;
  description?: string;
  location: string;
  min_budget?: number;
  max_budget?: number;
  created_at: string;
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  owner_id: string;     // ✅ from Supabase (not customer_id)
  worker_id?: string;   // ✅ nullable
  // Relations from PostgREST (!fk syntax)
  profiles_customer?: { id: string; email: string }[];
  profiles_worker?: { id: string; email: string }[];
}

// ✅ Remove role for now (infer from job ownership)
interface UserProfile {
  id: string;
  email: string;
}

export default function MyJobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentJobs, setCurrentJobs] = useState<Job[]>([]);
  const [jobHistory, setJobHistory] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ✅ Fetch real user
        const userRes = await fetch('/api/user/profile', {
          credentials: 'include',
        });
        if (userRes.status === 401) {
          router.push('/auth/login');
          return;
        }
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData: UserProfile = await userRes.json();
        setUser(userData);

        // ✅ Fetch jobs
        const jobsRes = await fetch('/api/user-jobs', {
          credentials: 'include',
        });
        if (!jobsRes.ok) throw new Error('Failed to load jobs');
        const jobs: Job[] = await jobsRes.json();

        setCurrentJobs(jobs.filter((j) => j.status !== 'completed'));
        setJobHistory(jobs.filter((j) => j.status === 'completed'));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // ✅ Real API call to mark job as completed
  const markFinished = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to complete job');

      // Optimistic update
      setCurrentJobs((prev) => prev.filter((j) => j.id !== jobId));
      const finished = currentJobs.find((j) => j.id === jobId);
      if (finished) {
        setJobHistory((prev) => [
          { ...finished, status: 'completed' },
          ...prev,
        ]);
      }
    } catch (err: any) {
      alert(err.message || 'Could not finish job');
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

  // ✅ Infer role per job: 
  // - If job.owner_id === user.id → you're the customer
  // - If job.worker_id === user.id → you're the worker
  // But for page heading, we can check: do you own ANY job?
  const ownsAnyJob = currentJobs.some((j) => j.owner_id === user.id) || 
                     jobHistory.some((j) => j.owner_id === user.id);
  const isWorkerView = !ownsAnyJob; // Simplified heuristic

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
          {isWorkerView ? 'My Jobs' : 'My Posted Jobs'}
        </h1>

        {/* Current Jobs */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-white">Ongoing Jobs</h2>
          {currentJobs.length ? (
            currentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                user={user}
                type="current"
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
            jobHistory.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                user={user}
                type="history"
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

function EmptyCard({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center border">
      <Icon className="mx-auto w-10 h-10 text-gray-400 mb-3" />
      <p className="text-gray-500">{text}</p>
    </div>
  );
}

function JobCard({
  job,
  user,
  type,
  onViewDetails,
  onMarkFinished,
}: {
  job: Job;
  user: UserProfile;
  type: 'current' | 'history';
  onViewDetails: () => void;
  onMarkFinished?: () => void;
}) {
  // ✅ Determine if current user is customer or worker for THIS job
  const isCustomer = job.owner_id === user.id;
  const isWorker = job.worker_id === user.id;

  // ✅ Get other party's display name (use email since no full_name)
  const otherParty = isCustomer
    ? job.profiles_worker?.[0]?.email?.split('@')[0] || 'Worker'
    : job.profiles_customer?.[0]?.email?.split('@')[0] || 'Customer';

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
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          {otherParty}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {job.location || 'Not specified'}
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <span className="font-semibold">
          {job.min_budget && job.max_budget
            ? `ZAR ${job.min_budget} - ${job.max_budget}`
            : job.min_budget
            ? `From ZAR ${job.min_budget}`
            : job.max_budget
            ? `Up to ZAR ${job.max_budget}`
            : '—'}
        </span>

        <div className="flex gap-3">
          {/* ✅ Only workers can mark as finished */}
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