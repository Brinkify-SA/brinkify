"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Home,
  Briefcase,
  MapPin,
  Clock,
  MessageCircle,
  ArrowLeft,
  UserCheck,
  UserX,
} from "lucide-react";
import Loader from "@/components/loader"; // Assuming a Loader component exists

interface UserProfile {
  id: string;
  full_name: string;
  role: "worker" | "customer" | "company";
  location: string;
  plan_name: string;
  job_leads_used: number;
  leads_limit: number;
}

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  min_budget?: number;
  max_budget?: number;
  created_at: string;
  status: "open" | "assigned" | "in-progress" | "completed" | "cancelled";
  owner_id: string;  // homeowner who posted
  worker_id?: string;  // assigned worker (nullable)
  images?: string[];
  owner?: { id: string; full_name?: string | null; avatar_url?: string | null };
  profiles_owner?: { id: string; email?: string; full_name?: string };
  profiles_worker?: { id: string; email?: string; full_name?: string };
  applications?: {
    id: string;
    worker_id: string;
    status: "pending" | "approved" | "denied";
    profiles?: { full_name?: string; avatar_url?: string };
  }[];
  conversations?: { id: string }[];
}

export default function JobsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchJobsFromAPI = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user profile
        const userRes = await fetch("/api/user/profile", {
          credentials: "include",
        });
        
        let userData = null;
        if (userRes.ok) {
          userData = await userRes.json();
          setUser({
            id: userData.id,
            full_name: (userData.first_name || "") + " " + (userData.last_name || ""),
            role: userData.role || "worker",
            location: userData.location || "South Africa",
            plan_name: userData.plan?.name || "Professional",
            job_leads_used: 0,
            leads_limit: 50,
          });
        }

        // Fetch jobs
        const response = await fetch(
          userData && userData.role !== "worker" ? "/api/user-jobs" : "/api/feed",
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let jobsData: Job[] = await response.json();
        
        // If user is a worker, filter by location
        if (userData && userData.role === "worker" && userData.location) {
          const userCity = userData.location.split(",")[0]?.trim().toLowerCase();
          jobsData = jobsData.filter((job: Job) => 
            job.location?.toLowerCase().includes(userCity)
          );
        }
        
        setJobs(jobsData);
      } catch (err) {
        console.error("Error loading jobs:", err);
        setError((err as any)?.message || "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobsFromAPI();
  }, [router]);

  // Auto-enter edit mode if ?edit={jobId} is present (owners only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (!editId || !user || user.role === 'worker') return;
    const target = jobs.find((j) => j.id === editId);
    if (!target) return;
    setEditingJobId(target.id);
    setEditForm({
      title: target.title,
      description: target.description,
      category: target.category,
      location: target.location,
      min_budget: target.min_budget,
      max_budget: target.max_budget,
      images: target.images || [],
    });
  }, [user, jobs]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    router.push("/auth/login");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Apply error:', errorData);
        throw new Error(errorData.error || errorData.details || "Failed to apply to job");
      }

      const target = jobs.find((j) => j.id === jobId);
      const loc = target?.location ? ` in ${target.location}` : "";
      setMessage({ type: "success", text: `Application submitted${loc}.` });
      // Refresh jobs to show updated application status
      const jobsRes = await fetch("/api/feed", { credentials: "include" });
      if (jobsRes.ok) {
        let jobsData = await jobsRes.json();
        // Re-apply location filter if needed
        if (user.role === "worker" && user.location) {
          const userCity = user.location.split(",")[0]?.trim().toLowerCase();
          jobsData = jobsData.filter((job: Job) => 
            job.location?.toLowerCase().includes(userCity)
          );
        }
        setJobs(jobsData);
      }
    } catch (err) {
      console.error("Error applying to job:", err);
      setMessage({
        type: "error",
        text: (err as any)?.message || "Failed to apply to job.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Inline edit state
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Job>>({});

  const startEdit = (job: Job) => {
    setEditingJobId(job.id);
    setEditForm({
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      min_budget: job.min_budget,
      max_budget: job.max_budget,
      images: job.images || [],
    });
  };

  const cancelEdit = () => {
    setEditingJobId(null);
    setEditForm({});
    router.replace("/jobs");
  };

  const saveEdit = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to update job');

      setMessage({ type: 'success', text: 'Job updated.' });
      // Refresh jobs
      const listUrl = user && user.role !== 'worker' ? '/api/user-jobs' : '/api/feed';
      const listRes = await fetch(listUrl, { credentials: 'include' });
      if (listRes.ok) {
        let jobsData = await listRes.json();
        if (user?.role === 'worker' && user?.location) {
          const userCity = user.location.split(',')[0]?.trim().toLowerCase();
          jobsData = jobsData.filter((job: Job) => job.location?.toLowerCase().includes(userCity));
        }
        setJobs(jobsData);
      }
      cancelEdit();
    } catch (err) {
      console.error('Edit job error:', err);
      setMessage({ type: 'error', text: (err as any)?.message || 'Failed to update job.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete job');

      setMessage({ type: 'success', text: 'Job deleted.' });
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Delete job error:', err);
      setMessage({ type: 'error', text: (err as any)?.message || 'Failed to delete job.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (
    jobId: string,
    workerId: string,
    applicationId: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/jobs/${jobId}/applications/${applicationId}/approve`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId }),
        }
      );
      if (!res.ok) throw new Error("Approval failed");

      setMessage({ type: "success", text: "Worker approved successfully." });

      // Refresh jobs
      const jobsRes = await fetch("/api/feed", { credentials: "include" });
      if (jobsRes.ok) {
        let jobsData = await jobsRes.json();
        if (user?.role === "worker" && user.location) {
          const userCity = user.location.split(",")[0]?.trim().toLowerCase();
          jobsData = jobsData.filter((job: Job) =>
            job.location?.toLowerCase().includes(userCity)
          );
        }
        setJobs(jobsData);
      }
    } catch (err) {
      console.error("Error approving worker:", err);
      setMessage({
        type: "error",
        text: (err as any)?.message || "Failed to approve worker.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (applicationId: string) => {
    // Identify the job containing this application
    const parentJob = jobs.find((j) =>
      (j.applications ?? []).some((a) => a.id === applicationId)
    );
    if (!parentJob) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/jobs/${parentJob.id}/applications/${applicationId}/deny`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId }),
        }
      );
      if (!res.ok) throw new Error("Deny failed");

      setMessage({ type: "success", text: "Application denied." });

      // Refresh jobs
      const jobsRes = await fetch("/api/feed", { credentials: "include" });
      if (jobsRes.ok) {
        let jobsData = await jobsRes.json();
        if (user?.role === "worker" && user.location) {
          const userCity = user.location.split(",")[0]?.trim().toLowerCase();
          jobsData = jobsData.filter((job: Job) =>
            job.location?.toLowerCase().includes(userCity)
          );
        }
        setJobs(jobsData);
      }
    } catch (err) {
      console.error("Error denying application:", err);
      setMessage({
        type: "error",
        text: (err as any)?.message || "Failed to deny application.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (targetUserId: string, jobId?: string) => {
    if (!user) {
      setMessage({ type: "error", text: "Please log in to send messages." });
      return;
    }

    setLoading(true);
    try {
      // Mock message functionality - just navigate to messages page
      router.push(`/messages`);
    } catch (err) {
      console.error("Error handling message:", err);
      setMessage({
        type: "error",
        text: (err as any)?.message || "Failed to start conversation.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="ml-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">
          No user data found. Please log in.
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="ml-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const isWorker = user.role === "worker";
  const userCity = user.location.split(",")[0]?.trim() || user.location;

  if (isWorker && user.job_leads_used >= user.leads_limit) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white md:hidden">
              Jobs
            </h1>
            <div className="hidden md:block">
              <ModeToggle />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg">
            <p className="font-bold">You have reached your monthly limit</p>
            <p>You’ve used all {user.leads_limit} job leads this month.</p>
            <button
              onClick={() => router.push("/pricing")}
              className="mt-2 text-blue-600 hover:underline font-semibold"
            >
              Upgrade to apply to more jobs
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white md:hidden">
            {isWorker ? "Jobs" : "My Jobs"}
          </h1>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          <button
            onClick={toggleMenu}
            className="md:hidden text-blue-600 dark:text-blue-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={toggleMenu}
          ></div>
          <div className="absolute left-0 top-0 h-full w-3/4 bg-blue-600 text-white p-6 pt-16">
            <button
              onClick={toggleMenu}
              className="absolute top-4 right-4 text-white"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <nav className="flex flex-col space-y-4 mt-6">
              <button
                onClick={() => navigate("/")}
                className="text-left text-lg font-medium"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/explore")}
                className="text-left text-lg font-medium"
              >
                Explore
              </button>
              <button
                onClick={() => navigate("/about")}
                className="text-left text-lg font-medium"
              >
                About Us
              </button>
              <button
                onClick={handleLogout}
                className="text-left text-lg font-medium"
              >
                Log Out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {isWorker ? "Available Jobs" : "Your Posted Jobs"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isWorker
              ? `Jobs in ${userCity} and nearby areas`
              : "Review and manage applicants for your jobs."}
          </p>
        </div>{" "}
        {/* Closing div for mb-8 */}
        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}
        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              {isWorker
                ? `No jobs in ${userCity} right now`
                : "No jobs posted yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isWorker
                ? "Jobs are added daily. Check back soon or update your location."
                : "Post your first job to receive applications from skilled workers."}
            </p>
            {isWorker ? (
              <button
                onClick={() => navigate("/profile/edit")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Update Location
              </button>
            ) : (
              <button
                onClick={() => navigate("/post-job")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Post a Job
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {/* Job Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {job.description}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      job.status === "open"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : job.status === "assigned"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {/* Poster (owner) */}
                  {job.owner && (
                    <div className="flex items-center gap-2">
                      <img
                        src={job.owner.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(job.owner.full_name || 'User')}`}
                        alt={job.owner.full_name || 'User'}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(job.owner?.full_name || 'User')}`;
                        }}
                      />
                      <span className="font-medium">{job.owner.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  {(job.min_budget || job.max_budget) && (
                    <div className="font-medium">
                      ZAR{" "}
                      {job.min_budget ? job.min_budget.toLocaleString() : ""}{" "}
                      {job.min_budget && job.max_budget ? "-" : ""}{" "}
                      {job.max_budget ? job.max_budget.toLocaleString() : ""}
                    </div>
                  )}
                </div>

                {/* Owner edit controls */}
                {!isWorker && (
                  <div className="flex justify-end gap-2 mb-4">
                    {editingJobId === job.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(job.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(job)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Edit form */}
                {!isWorker && editingJobId === job.id && (
                  <div className="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`title-${job.id}`} className="block text-xs mb-1">Title</label>
                        <input
                          id={`title-${job.id}`}
                          value={editForm.title ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label htmlFor={`location-${job.id}`} className="block text-xs mb-1">Location</label>
                        <input
                          id={`location-${job.id}`}
                          value={editForm.location ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor={`description-${job.id}`} className="block text-xs mb-1">Description</label>
                        <textarea
                          id={`description-${job.id}`}
                          value={editForm.description ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label htmlFor={`min-${job.id}`} className="block text-xs mb-1">Min Budget (ZAR)</label>
                        <input
                          type="number"
                          id={`min-${job.id}`}
                          value={editForm.min_budget ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, min_budget: e.target.value === '' ? undefined : Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label htmlFor={`max-${job.id}`} className="block text-xs mb-1">Max Budget (ZAR)</label>
                        <input
                          type="number"
                          id={`max-${job.id}`}
                          value={editForm.max_budget ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, max_budget: e.target.value === '' ? undefined : Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {isWorker ? (
                  <div className="flex justify-end gap-2">
                    {job.conversations && job.conversations.length > 0 && (
                      <button
                        onClick={() => handleMessage(job.owner_id, job.id)}
                        className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                    {job.status === "open" &&
                      !job.applications?.some(
                        (app) => app.worker_id === user.id
                      ) && (
                        <button
                          onClick={() => handleApply(job.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Apply
                        </button>
                      )}
                    {job.applications?.some(
                      (app) =>
                        app.worker_id === user.id && app.status === "pending"
                    ) && (
                      <span className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        Applied (Pending)
                      </span>
                    )}
                    {job.applications?.some(
                      (app) =>
                        app.worker_id === user.id && app.status === "approved"
                    ) && (
                      <span className="px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400">
                        Approved!
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                      Applicants ({job.applications?.length || 0})
                    </h4>
                    {job.applications && job.applications.length > 0 ? (
                      <div className="space-y-3">
                        {job.applications.map((applicant) => (
                          <div
                            key={applicant.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  applicant.profiles?.avatar_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    applicant.profiles?.full_name || "User"
                                  )}&background=4F46E5&color=fff`
                                }
                                alt={
                                  applicant.profiles?.full_name || "Applicant"
                                }
                                className="w-10 h-10 rounded-full"
                              />
                              <span className="font-medium">
                                {applicant.profiles?.full_name}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {job.conversations &&
                                job.conversations.length > 0 && (
                                  <button
                                    type="button"
                                    title="Message"
                                    onClick={() =>
                                      handleMessage(applicant.worker_id, job.id)
                                    }
                                    className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  </button>
                                )}
                              {applicant.status === "pending" &&
                                job.status === "open" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleApprove(
                                          job.id,
                                          applicant.worker_id,
                                          applicant.id
                                        )
                                      }
                                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                                      title="Approve"
                                    >
                                      <UserCheck className="w-5 h-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeny(applicant.id)}
                                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                                      title="Deny"
                                    >
                                      <UserX className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                              {applicant.status === "approved" && (
                                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                  Approved
                                </span>
                              )}
                              {applicant.status === "denied" && (
                                <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                                  Denied
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No applicants yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-6 text-center">
        <div className="container mx-auto px-4">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            Brinkify SA
          </span>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            © {new Date().getFullYear()} Connecting skilled workers with
            homeowners across South Africa.
          </p>
        </div>
      </footer>
    </div>
  );
}
