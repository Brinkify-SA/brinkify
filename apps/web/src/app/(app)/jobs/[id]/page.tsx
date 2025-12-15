'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  MessageCircle,
  UserCheck,
  UserX,
  ArrowLeft,
} from 'lucide-react';
import { createClient as createBrowserClient } from '@/utils/supabase/client';

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const jobId = Array.isArray(id) ? id[0] : id;

  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD JOB + USER ---------------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const jobRes = await fetch(`/api/jobs/${jobId}`, {
          credentials: 'include',
        });
        if (!jobRes.ok) throw new Error('Failed to load job');
        setJob(await jobRes.json());

        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getUser();
        setUser(data?.user ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) load();
  }, [jobId]);

  /* ---------------- DERIVED FLAGS ---------------- */
  const isOwner = user && job && job.customer_id === user.id;

  /* ---------------- ACTIONS ---------------- */
  const handleApprove = async (applicationId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/jobs/${jobId}/applications/${applicationId}/approve`,
        { method: 'POST', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Approve failed');
      setJob(await (await fetch(`/api/jobs/${jobId}`)).json());
      alert('Worker approved');
    } catch (e) {
      alert('Failed to approve worker');
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (applicationId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/jobs/${jobId}/applications/${applicationId}/deny`,
        { method: 'POST', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Deny failed');
      setJob(await (await fetch(`/api/jobs/${jobId}`)).json());
      alert('Application denied');
    } catch (e) {
      alert('Failed to deny application');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STATES ---------------- */
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center">Job not found</div>;
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-bold truncate">{job.title}</h1>
          <div className="ml-auto hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* JOB INFO */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border">
          <p className="text-gray-600 dark:text-gray-300">{job.description}</p>

          <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
            <div className="flex gap-2"><MapPin className="w-4 h-4" /> {job.location}</div>
            <div className="flex gap-2"><Clock className="w-4 h-4" /> {new Date(job.created_at).toDateString()}</div>
            <div className="flex gap-2"><DollarSign className="w-4 h-4" /> R {job.min_budget ?? 'TBD'}</div>
            <div className="flex gap-2"><Briefcase className="w-4 h-4" /> Job status: {job.status}</div>
          </div>
        </div>

        {/* APPLICATIONS */}
        {isOwner && job.status === 'open' && job.applications?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border">
            <h2 className="font-bold mb-4">
              Applicants ({job.applications.length})
            </h2>

            <div className="space-y-3">
              {job.applications.map((app: any) => (
                <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {app.profiles?.full_name ?? app.worker_id}
                    </p>
                    <p className="text-xs text-gray-500">Status: {app.status}</p>
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(app.id)} className="text-green-600">
                        <UserCheck />
                      </button>
                      <button onClick={() => handleDeny(app.id)} className="text-red-600">
                        <UserX />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
