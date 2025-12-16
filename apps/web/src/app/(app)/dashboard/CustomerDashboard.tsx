import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, MessageSquare, Users, MapPin, Clock, Star } from "lucide-react";
import type { UserProfile } from "@/utils/types/UserProfile";

export function CustomerDashboard({ user }: { user: UserProfile }) {
  const [stats, setStats] = useState([
    { label: "Active Jobs", value: "0", change: "" },
    { label: "Total Spent", value: "R 0", change: "" },
    { label: "Saved Pros", value: "0", change: "" },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [loadingCompleted, setLoadingCompleted] = useState(true);

  useEffect(() => {
    const fetchCustomerStats = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch('/api/user/stats', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch stats');
        
        const data = await res.json();
        
        setStats([
          { 
            label: "Active Jobs", 
            value: data.activeJobs?.toString() || "0", 
            change: "" 
          },
          {
            label: "Total Spent",
            value: `R ${data.totalSpent?.toLocaleString() || "0"}`,
            change: "",
          },
          {
            label: "Total Applicants",
            value: data.totalApplicants?.toString() || "0",
            change: "",
          },
        ]);
      } catch (error) {
        console.error("Error loading customer stats:", error);
        // Fallback to zeros
        setStats([
          { label: "Active Jobs", value: "0", change: "" },
          { label: "Total Spent", value: "R 0", change: "" },
          { label: "Total Applicants", value: "0", change: "" },
        ]);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchCustomerStats();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await fetch("/api/user-jobs", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load jobs");
        const data = await res.json();
        // Show only jobs posted by this customer
        const posted = (data || []).filter((j: any) => j.owner_id === user.id);
        setJobs(posted);
        // Optionally update stats with real counts
        setStats((prev) => {
          const next = [...prev];
          const idx = next.findIndex((s) => s.label === "Active Jobs");
          if (idx >= 0) next[idx] = { ...next[idx], value: String(posted.length) };
          return next;
        });
      } catch (e) {
        console.error("Error loading user jobs:", e);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [user.id]);

  useEffect(() => {
    const fetchCompletedJobs = async () => {
      setLoadingCompleted(true);
      try {
        const res = await fetch("/api/user-jobs", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load jobs");
        const data = await res.json();
        
        // Get completed jobs
        const completed = (data || []).filter(
          (j: any) => j.owner_id === user.id && j.status === 'completed'
        );

        // Fetch reviews for each completed job
        const jobsWithReviews = await Promise.all(
          completed.map(async (job: any) => {
            try {
              const reviewRes = await fetch(`/api/jobs/${job.id}/review`, {
                credentials: 'include',
              });
              if (reviewRes.ok) {
                const { review } = await reviewRes.json();
                return { ...job, review };
              }
            } catch (e) {
              console.error(`Error fetching review for job ${job.id}:`, e);
            }
            return job;
          })
        );

        setCompletedJobs(jobsWithReviews);
      } catch (e) {
        console.error("Error loading completed jobs:", e);
      } finally {
        setLoadingCompleted(false);
      }
    };
    fetchCompletedJobs();
  }, [user.id]);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/post-job"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Home className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Post a Job</span>
          </Link>
          <Link
            href="/feed"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>View Feed</span>
          </Link>
          <Link
            href="/messages"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Messages</span>
          </Link>
          <Link
            href="/my-jobs"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Users className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Manage Applicants</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingStats ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
          </>
        ) : (
          stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              {stat.change && (
                <p className="text-gray-500 text-sm mt-1">{stat.change}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Your Posted Jobs */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Your Posted Jobs</h2>
          <div className="flex items-center gap-2">
            <Link href="/jobs" className="text-blue-600 dark:text-blue-400 hover:underline">
              Manage
            </Link>
            <Link href="/post-job" className="text-blue-600 dark:text-blue-400 hover:underline">
              Post New
            </Link>
          </div>
        </div>
        {loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div className="h-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 animate-pulse" />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">You haven't posted any jobs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jobs.slice(0, 6).map((job: any) => (
              <div key={job.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1">Applicants: {Array.isArray(job.applications) ? job.applications.length : 0}</span>
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded font-medium border border-gray-300 dark:border-gray-600 whitespace-nowrap">
                    {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/jobs/${job.id}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">View</Link>
                  <Link href={{ pathname: "/jobs", query: { edit: job.id } }} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs with Reviews */}
      {completedJobs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Completed Jobs & Reviews</h2>
            <Link href="/jobs" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              View All
            </Link>
          </div>
          {loadingCompleted ? (
            <div className="space-y-3">
              <div className="h-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div className="h-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-3">
              {completedJobs.slice(0, 5).map((job: any) => (
                <div key={job.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{job.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Review Display */}
                      {job.review ? (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= job.review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Your Rating
                            </span>
                          </div>
                          {job.review.comment && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              "{job.review.comment}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Star className="w-4 h-4" />
                            Rate this job
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="text-xs px-2 py-1 rounded font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 whitespace-nowrap">
                      Completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
