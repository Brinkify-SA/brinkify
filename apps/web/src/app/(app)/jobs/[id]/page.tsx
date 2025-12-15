// app/jobs/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import {
  MapPin,
  Clock,
  DollarSign,
  User,
  Briefcase,
  MessageCircle,
  UserCheck,
  UserX,
  ArrowLeft,
} from "lucide-react";
import { createClient as createBrowserClient } from "@/utils/supabase/client";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const jobId = Array.isArray(id) ? id[0] : id;

  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${jobId}/applications`, { credentials: 'include' });
        if (!res.ok) {
          // If endpoint fails, try to fetch job from user-jobs or return gracefully
          console.error('applications endpoint returned', res.status);
          setJob(null);
          return;
        }
        const payload = await res.json();
        const applications = payload.applications || [];

        // Derive job info from related jobs record if present
        let jobInfo = null;
        if (applications.length > 0 && applications[0].jobs) {
          jobInfo = applications[0].jobs;
        } else {
          // fallback: try fetching job from a user-jobs endpoint or set minimal info
          const jobRes = await fetch(`/api/user-jobs`, { credentials: 'include' });
          if (jobRes.ok) {
            const jobs = await jobRes.json();
            jobInfo = jobs.find((j: any) => j.id === jobId) || null;
          }
        }

        // Map applications into UI-friendly applicants array
        const applicants = applications.map((a: any) => ({
          id: a.id,
          name: a.users?.full_name || a.users?.email || a.worker_id || 'Unknown',
          avatar: a.users?.avatar_url || a.users?.avatar || '/default-avatar.png',
          status: a.status || 'pending',
          conversationId: a.conversation_id || null,
          raw: a,
        }));

        setJob({ ...(jobInfo || {}), applicants, status: (jobInfo && jobInfo.status) || 'open' });

        // get current user
        try {
          const supabase = createBrowserClient();
          const { data } = await supabase.auth.getUser();
          setUser(data?.user || null);
        } catch (e) {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load job detail', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) load();
  }, [jobId]);

  const isWorker = user?.role === 'worker';
  const isOwner = user && job && (job.customer_id === user.id || job.customer_id === user?.sub);
  const isAssignedWorker = user && job && job.worker_id === user.id;

  const handleBack = () => router.push('/jobs');
  const handleMessage = (convId: string) => router.push(`/messages/${convId}`);

  const handleApprove = async (applicationId: string) => {
    if (!jobId || !applicationId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications/${applicationId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Approve failed');
      const refreshed = await (await fetch(`/api/jobs/${jobId}/applications`, { credentials: 'include' })).json();
      const applications = refreshed.applications || [];
      const applicants = applications.map((a: any) => ({
        id: a.id,
        name: a.users?.full_name || a.users?.email || a.worker_id || 'Unknown',
        avatar: a.users?.avatar_url || a.users?.avatar || '/default-avatar.png',
        status: a.status || 'pending',
        conversationId: a.conversation_id || null,
        raw: a,
      }));
      let jobInfo = null;
      if (applications.length > 0 && applications[0].jobs) jobInfo = applications[0].jobs;
      setJob({ ...(jobInfo || {}), applicants, status: (jobInfo && jobInfo.status) || 'assigned' });
      alert('Worker approved and assigned');
    } catch (err) {
      console.error(err);
      alert('Failed to approve worker');
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (applicationId: string) => {
    if (!jobId || !applicationId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications/${applicationId}/deny`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Deny failed');
      const refreshed = await (await fetch(`/api/jobs/${jobId}/applications`, { credentials: 'include' })).json();
      const applications = refreshed.applications || [];
      const applicants = applications.map((a: any) => ({
        id: a.id,
        name: a.users?.full_name || a.users?.email || a.worker_id || 'Unknown',
        avatar: a.users?.avatar_url || a.users?.avatar || '/default-avatar.png',
        status: a.status || 'pending',
        conversationId: a.conversation_id || null,
        raw: a,
      }));
      let jobInfo = null;
      if (applications.length > 0 && applications[0].jobs) jobInfo = applications[0].jobs;
      setJob({ ...(jobInfo || {}), applicants, status: (jobInfo && jobInfo.status) || 'open' });
      alert('Application denied');
    } catch (err) {
      console.error(err);
      alert('Failed to deny application');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={handleBack} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Jobs</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate">{job.title}</h1>
          <div className="ml-auto hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Job Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{job.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
              job.status === 'assigned' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {job.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>Posted {job.postedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>
                {job.budgetType === 'hourly' ? 'R' + job.budgetAmount + '/hr' : 'R ' + job.budgetAmount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isWorker ? (
                <>
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Posted by: {job.customer.name}</span>
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Category: Electricians</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            {isWorker && job.status === 'open' && (
              <button
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Apply
              </button>
            )}

            {isOwner && job.status === 'open' && job.applicants?.length > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Review {job.applicants.length} applicants
              </span>
            )}

            {isAssignedWorker && (
              <button
                onClick={() => job.worker && handleMessage(job.worker.conversationId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Message Customer
              </button>
            )}
          </div>
        </div>

        {/* Applicants Section (for Homeowners) */}
        {isOwner && job.status === 'open' && job.applicants && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Applicants ({job.applicants.length})
            </h2>
            <div className="space-y-4">
              {job.applicants.map((applicant: any) => (
                <div key={applicant.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={applicant.avatar}
                      alt={applicant.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="font-medium">{applicant.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      title="Message"
                      onClick={() => handleMessage(applicant.conversationId)}
                      className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    {applicant.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(applicant.id)}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                          title="Approve"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeny(applicant.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                          title="Deny"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Worker (for Homeowners) */}
        {isOwner && job.worker && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Assigned Worker</h2>
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={job.worker.avatar}
                  alt={job.worker.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{job.worker.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status: {job.status}</p>
                </div>
              </div>
              <button
                onClick={() => handleMessage(job.worker.conversationId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4" /> Message
              </button>
            </div>
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
