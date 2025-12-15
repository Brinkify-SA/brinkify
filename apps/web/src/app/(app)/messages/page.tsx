// app/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { MessageSquare, MapPin, Briefcase, Trash2 } from "lucide-react";
import Loader from "@/components/loader"; // Assuming a Loader component exists
import { getClientCookie } from "@/utils/client/cookies";
import moment from "moment";

interface UserProfile {
  id: string;
  full_name: string;
  role: "worker" | "customer" | "company";
  avatar_url: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDataAndConversations = async () => {
      const appUser = getClientCookie("app-user");
      if (!appUser) {
        router.push("/api/auth/logout");
        return;
      }
      setUser(appUser);
      setLoading(true);
      setError(null);
      try {
        const req = await fetch("/api/chats");
        if (!req.ok) {
          throw new Error(`Error fetching conversations: ${req.statusText}`);
        }
        const res = await req.json();

        setConversations(res.data);
      } catch (err) {
        setError((err as any)?.message || "Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndConversations();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleLogout = () => {
    router.push("/api/auth/logout");
  };

  const deleteHelpConversation = (convId: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;
  };

  const handleBack = () => {
    router.push("/dashboard");
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">Messages</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white md:hidden">
            Messages
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

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isWorker
                ? "Your conversations with homeowners"
                : "Your conversations with workers"}
            </p>
          </div>
          {!isWorker && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              New Message
            </button>
          )}
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isWorker
                ? "You’ll see messages here when homeowners contact you."
                : "Start a job to connect with skilled workers."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => {
              const otherUser = conv.recipient;
              otherUser.full_name =
                otherUser.first_name +
                (otherUser.last_name ? ` ${otherUser.last_name}` : "");
              const jobTitle = conv.jobs?.title || "General Chat";
              const jobLocation = conv.jobs?.location || "";

              if (!otherUser) return null; // Handle case where otherUser might be null

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <img
                        src={
                          otherUser.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            otherUser.full_name || "User"
                          )}&background=4F46E5&color=fff`
                        }
                        alt={otherUser.full_name}
                        className="w-12 h-12 rounded-full"
                      />
                      {conv.unread_by_user && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h2 className="font-bold text-gray-800 dark:text-white truncate">
                          {otherUser.full_name}
                        </h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {moment(
                            conv.messages[conv.messages.length - 1]?.created_at
                          ).fromNow()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {conv.job_id ? (
                          <Briefcase className="w-3 h-3" />
                        ) : (
                          <MessageSquare className="w-3 h-3" />
                        )}
                        <span>{jobTitle}</span>
                        {jobLocation && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{jobLocation}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-1">
                        {conv.messages[conv.messages.length - 1]?.content ||
                          "No messages yet."}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
