"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Briefcase, Star } from "lucide-react";
import Loader from "@/components/loader";

interface Job {
  id: string;
  created_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
  images: string[];
  rating: string;
}

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/my-jobs")
      .then(res => res.json())
      .then(data => setJobs(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1 text-blue-600 font-medium mb-4"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="text-3xl font-bold mb-2">My Jobs</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Jobs you have posted.</p>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-1">Job — {job.id.slice(0,8)}</h2>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Posted: {new Date(job.created_at).toLocaleDateString()}
              </p>

              {job.customer && (
                <p className="mt-2 font-medium">Posted By: {job.customer.name}</p>
              )}

              {job.images.length > 0 && (
                <img
                  src={job.images[0]}
                  className="w-full h-48 rounded-lg object-cover mt-3"
                />
              )}

              <div className="flex items-center gap-1 text-yellow-500 mt-3">
                <Star size={18} />
                <span>{job.rating}</span>
              </div>

              <button
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="mt-3 text-blue-600 underline font-medium"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="You have not posted any jobs yet." icon={<Briefcase />} />
      )}
    </div>
  );
}

function Empty({ text, icon }: any) {
  return (
    <div className="p-6 rounded-lg text-center bg-white dark:bg-gray-800">
      <div className="flex justify-center opacity-60">{icon}</div>
      <p className="mt-2 text-gray-500">{text}</p>
    </div>
  );
}
