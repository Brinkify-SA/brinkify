import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, MessageSquare } from "lucide-react";
import type { UserProfile } from "@/utils/types/UserProfile";

export function CustomerDashboard({ user }: { user: UserProfile }) {
  const [stats, setStats] = useState([
    { label: "Active Jobs", value: "0", change: "" },
    { label: "Total Spent", value: "R 0", change: "" },
    { label: "Saved Pros", value: "0", change: "" },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchCustomerStats = async () => {
      setLoadingStats(true);
      try {
        // Mock data for customer
        setStats([
          { label: "Active Jobs", value: "2", change: "+1 pending" },
          {
            label: "Total Spent",
            value: `ZAR ${user.total_spent?.toLocaleString() || "15,500"}`,
            change: "",
          },
          {
            label: "Saved Pros",
            value: user.saved_pros_count?.toString() || "12",
            change: "",
          },
        ]);
      } catch (error) {
        console.error("Error loading customer stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchCustomerStats();
  }, [user.total_spent, user.saved_pros_count]);

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
            <span>View Trends</span>
          </Link>
          <Link
            href="/messages"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Messages</span>
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
    </div>
  );
}
