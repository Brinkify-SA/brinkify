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
  Star,
  X,
} from 'lucide-react';
import { createClient as createBrowserClient } from '@/utils/supabase/client';

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const jobId = Array.isArray(id) ? id[0] : id;

  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<any>(null);

  /* ---------------- LOAD JOB + USER + REVIEW ---------------- */
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

        // Check if user has already reviewed this job
        if (data?.user) {
          const reviewRes = await fetch(`/api/jobs/${jobId}/review`, {
            credentials: 'include',
          });
          if (reviewRes.ok) {
            const { review } = await reviewRes.json();
            setExistingReview(review);
          }
        }
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

  const handleMessage = async () => {
    if (!user) {
      alert('Please log in to send a message');
      return;
    }
    
    setLoading(true);
    try {
      // Determine recipient: if owner, message the approved worker; if worker, message the owner
      const recipientId = isOwner ? job.worker_id : job.owner_id;
      
      if (!recipientId) {
        alert(isOwner ? 'No worker assigned yet' : 'Job owner not available');
        return;
      }

      // Create or find existing chat
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: recipientId }),
      });

      if (!res.ok) throw new Error('Failed to create conversation');
      const { data } = await res.json();
      
      // Navigate to the chat
      router.push(`/messages/${data.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageApplicant = async (applicantUserId: string) => {
    if (!user) {
      alert('Please log in to send a message');
      return;
    }
    
    setLoading(true);
    try {
      // Create or find existing chat with this applicant
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: applicantUserId }),
      });

      if (!res.ok) throw new Error('Failed to create conversation');
      const { data } = await res.json();
      
      // Navigate to the chat
      router.push(`/messages/${data.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit rating');
      }

      const { review } = await res.json();
      setExistingReview(review);
      setShowRatingModal(false);
      setRating(0);
      setComment('');
      alert('Rating submitted successfully!');
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to submit rating');
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

          {/* ACTION BUTTONS */}
          <div className="mt-4 flex flex-wrap gap-3">
            {user && ((isOwner && job.worker_id) || (!isOwner && job.owner_id)) && (
              <button
                onClick={handleMessage}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                {isOwner ? 'Message Worker' : 'Message Owner'}
              </button>
            )}

            {/* RATE WORKER BUTTON - Only for owner on completed jobs */}
            {user && isOwner && job.status === 'completed' && job.worker_id && !existingReview && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
              >
                <Star className="w-4 h-4" />
                Rate Worker
              </button>
            )}

            {/* SHOW EXISTING REVIEW */}
            {existingReview && (
              <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 fill-green-600" />
                  You rated this job: {existingReview.rating} stars
                </p>
                {existingReview.comment && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">"{existingReview.comment}"</p>
                )}
              </div>
            )}
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

                  <div className="flex gap-2">
                    {app.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(app.id)} 
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                          title="Approve application"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeny(app.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Deny application"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleMessageApplicant(app.user_id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                      title="Message applicant"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* RATING MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Rate Worker</h3>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setComment('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STAR RATING */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                How would you rate the worker's performance?
              </p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-2 text-sm font-medium">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* COMMENT */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this worker..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setComment('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0 || loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
              >
                {loading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
