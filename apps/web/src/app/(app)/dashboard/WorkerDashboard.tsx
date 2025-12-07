import type { UserProfile } from "@/utils/types/UserProfile";
import { Briefcase, MessageSquare, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function WorkerDashboard({ user }: { user: UserProfile }) {
  const [stats, setStats] = useState([
    { label: "Active Jobs", value: "0", change: "" },
    { label: "Total Earnings", value: "R 0", change: "" },
    { label: "Avg. Rating", value: "0.0", change: "" },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchWorkerStats = async () => {
      setLoadingStats(true);
      try {
        // Mock data for worker
        setStats([
          { label: "Active Jobs", value: "3", change: "+2 this week" },
          {
            label: "Total Earnings",
            value: `ZAR ${user.total_earnings?.toLocaleString() || "42,500"}`,
            change: "",
          },
          {
            label: "Avg. Rating",
            value: user.average_rating?.toFixed(1) || "4.8",
            change: "⭐",
          },
        ]);
      } catch (error) {
        console.error("Error loading worker stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchWorkerStats();
  }, [user.total_earnings, user.average_rating]);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/jobs"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Briefcase className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>View Jobs</span>
          </Link>
          <Link
            href="/my-jobs"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Briefcase className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>My Past Jobs</span>
          </Link>
          <Link
            href="/messages"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Messages</span>
          </Link>
          <Link
            href="/pricing"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Wallet className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>View Plans</span>
          </Link>
          <Link
            href="/request-help"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Users className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Request Help</span>
          </Link>
          <Link
            href="/help-requests"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Users className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Help Board</span>
          </Link>
          <Link
            href="/feed"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Users className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>View Feed</span>
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
                <p className="text-green-600 text-sm mt-1">{stat.change}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
