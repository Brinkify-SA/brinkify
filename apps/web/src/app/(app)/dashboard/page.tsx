// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Home, Settings, User as UserIcon, Menu, Search } from "lucide-react";
import Loader from "@/components/loader"; // Assuming a Loader component exists
import { WorkerDashboard } from "./WorkerDashboard";
import { CustomerDashboard } from "./CustomerDashboard";
import { CompanyDashboard } from "./CompanyDashboard";
import { getAvatarUrl } from "@/lib/avatars";
import type { UserProfile } from "@/utils/types/UserProfile";
import { getClientCookie } from "@/utils/client/cookies";

export default function DashboardPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      //get user info from cookies
      let appUser = getClientCookie("app-user");
      setLoading(true);
      setError(null);
      try {
        // Set the current user email
        setCurrentUserEmail(appUser.email);

        // Get the mock user data for this email

        appUser = {
          ...appUser,
          full_name: appUser.first_name + " " + appUser.last_name,
          avatar_url: getAvatarUrl(appUser.first_name),
        };
        setUser(appUser as UserProfile);
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError((err as any)?.message || "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any); // Cast to any to satisfy stricter Next.js 15.5.4 type
  };

  const handleLogout = () => {
    router.push("/api/auth/logout");
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  if (loading) {
    return <Loader />; // Use the Loader component for loading state
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="ml-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Go to Login
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
          onClick={() => router.push("/")}
          className="ml-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* TOP NAVBAR - keep consistent with Feed page */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Brinkify Dashboard
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate("/feed")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <Search className="w-4 h-4" />
              <span>Feed</span>
            </button>
            <ModeToggle />
            <button
              onClick={() => {
                handleLogout();
              }}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
            >
              Logout
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-blue-600 dark:text-blue-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <button
            onClick={() => {
              navigate("/dashboard");
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-blue-600"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              navigate("/feed");
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-blue-600"
          >
            Feed
          </button>
          <button
            onClick={() => {
              navigate("/explore");
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-blue-600"
          >
            Explore
          </button>
          <button
            onClick={() => {
              navigate("/about");
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-blue-600"
          >
            About Us
          </button>
          <Link
            href="/profile/edit"
            onClick={() => {
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-blue-600"
          >
            Edit Profile
          </Link>
          <button
            onClick={() => {
              handleLogout();
            }}
            className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      )}

      {/* --- Main Dashboard --- */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md relative">
          <Link
            href="/profile/edit"
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
            aria-label="Edit profile"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user.full_name}!
              </h1>
              <p className="opacity-90 mt-1">
                {user.role === "worker"
                  ? `Available in ${user.addresses[0].city} • Manage your jobs and grow your reputation.`
                  : user.role === "customer"
                  ? `Based in ${user.addresses[0].city} • Find trusted professionals for your home.`
                  : `Managing ${user.team_size || 0} workers • ${
                      user.active_projects || 0
                    } active projects in ${user.addresses[0].city}.`}
              </p>
              {/* Plan Usage */}
              {user.role !== "customer" && (
                <div className="mt-2 bg-blue-100/30 border border-blue-300 text-blue-800 p-2 rounded-md text-sm">
                  <p>
                    <span className="font-bold">
                      {user.plan.name.replace("_", " ").toUpperCase()} Plan
                    </span>{" "}
                    •{" "}
                    {user.role === "worker"
                      ? `${user.job_leads_used || 0} of ${
                          user.leads_limit || 5
                        } job leads used`
                      : `${user.job_leads_used || 0} of ${
                          user.leads_limit || 100
                        } leads used`}
                  </p>

                  <button
                    onClick={() => router.push("/pricing")}
                    className="mt-1 text-sm font-bold text-blue-800 hover:underline"
                  >
                    Upgrade Plan
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-0">
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-16 h-16 rounded-full border-2 border-white/30 cursor-pointer"
                onClick={handleEditProfile}
              />
            </div>
          </div>
          <div className="mt-4 text-center sm:text-left">
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              <UserIcon className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Role-Specific Dashboard */}
        {user.role === "worker" ? (
          <WorkerDashboard user={user} />
        ) : user.role === "customer" ? (
          <CustomerDashboard user={user} />
        ) : (
          <CompanyDashboard user={user} />
        )}
      </main>
    </div>
  );
}
