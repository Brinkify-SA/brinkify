import { useEffect, useState } from "react";

import {
  BarChart3,
  Briefcase,
  MessageSquare,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { UserProfile } from "@/utils/types/UserProfile";

interface CompanyProject {
  id: string;
  title: string;
  client_name: string; // Assuming client_name in projects table
  status: string;
  created_at: string;
}

export function CompanyDashboard({ user }: { user: UserProfile }) {
  const [stats, setStats] = useState([
    {
      label: "Team Members",
      value: user.team_size?.toString() || "0",
      icon: Users,
    },
    {
      label: "Active Projects",
      value: user.active_projects?.toString() || "0",
      icon: Briefcase,
    },
    {
      label: "Leads Used",
      value: `${user.job_leads_used || 0}/${user.leads_limit || 100}`,
      icon: BarChart3,
    },
  ]);
  const [recentProjects, setRecentProjects] = useState<CompanyProject[]>([
    {
      id: "1",
      title: "Office Renovation",
      client_name: "Tech Corp Ltd",
      status: "in-progress",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      title: "Warehouse Extension",
      client_name: "Logistics Inc",
      status: "completed",
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchCompanyStats = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch('/api/user/stats', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch stats');
        
        const data = await res.json();
        
        setStats([
          {
            label: "Team Members",
            value: data.teamSize?.toString() || "0",
            icon: Users,
          },
          {
            label: "Active Projects",
            value: data.activeProjects?.toString() || "0",
            icon: Briefcase,
          },
          {
            label: "Leads Used",
            value: `${user.job_leads_used || 0}/${user.leads_limit || 100}`,
            icon: BarChart3,
          },
        ]);
      } catch (error) {
        console.error("Error loading company stats:", error);
        // Fallback to zeros
        setStats([
          {
            label: "Team Members",
            value: "0",
            icon: Users,
          },
          {
            label: "Active Projects",
            value: "0",
            icon: Briefcase,
          },
          {
            label: "Leads Used",
            value: `0/${user.leads_limit || 100}`,
            icon: BarChart3,
          },
        ]);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchRecentProjects = async () => {
      setLoadingProjects(true);
      try {
        // Fetch real projects from API
        const res = await fetch('/api/user-jobs', { credentials: 'include' });
        if (res.ok) {
          const jobs = await res.json();
          const recent = jobs.slice(0, 5).map((j: any) => ({
            id: j.id,
            title: j.title,
            client_name: j.profiles_owner?.full_name || 'Unknown Client',
            status: j.status,
            created_at: j.created_at
          }));
          setRecentProjects(recent);
        }
      } catch (error) {
        console.error("Error loading recent projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchCompanyStats();
    fetchRecentProjects();
  }, [user.id, user.leads_limit, user.job_leads_used]);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Business Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/company/team"
            as="/company/team"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Users className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Team</span>
          </Link>
          <Link
            href="/company/projects"
            as="/company/projects"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Briefcase className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Projects</span>
          </Link>
          <Link
            href="/messages"
            as="/messages"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Messages</span>
          </Link>
          <Link
            href="/pricing"
            as="/pricing"
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            <Wallet className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Upgrade Plan</span>
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
              <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Projects</h2>
          <Link
            href="/company/projects"
            as="/company/projects"
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {loadingProjects ? (
            <>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 animate-pulse h-16"></div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 animate-pulse h-16"></div>
            </>
          ) : recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For {project.client_name} •{" "}
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    project.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
                >
                  {project.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No recent projects found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
