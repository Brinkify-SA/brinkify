// app/profile/edit/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import {
  User,
  Mail,
  MapPin,
  Camera,
  Star,
  Briefcase,
  Home,
  Tag,
  X,
  Link as LinkIcon,
  Banknote,
} from "lucide-react";
import Loader from "@/components/loader"; // Assuming a Loader component exists
import type { UserProfile } from "@/utils/types/UserProfile";
import { getUserFromCookies } from "@/utils/base64Utils";
import { getAvatarUrl } from "@/lib/avatars";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<any>({
    id: "",
    full_name: "", // Changed from name to full_name
    email: "",
    role: "worker", // Default role, will be overwritten by fetched data
    location: "",
    avatar_url: "",
    skills: [],
    bio: "",
    hourly_rate: "",
    portfolio: [],
    bank_name: "",
    account_number: "",
    branch_code: "",
    id_number: "", // Added id_number
    preferred_categories: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true); // Set to true initially for data fetching
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Mock workers data that matches profile page
  const mockWorkers = {
    "2": {
      id: "2",
      full_name: "Sarah Worker",
      email: "worker@test.com",
      role: "worker" as const,
      location: "Cape Town, Southern Suburbs",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      bio: "Experienced landscaper with 8+ years in the industry. Specialized in garden design and maintenance.",
      skills: ["Landscaping", "Garden Design", "Pruning", "Soil Preparation"],
      hourly_rate: "180",
      portfolio: [
        {
          title: "Rose Garden Project",
          url: "https://images.pexels.com/photos/1105726/pexels-photo-1105726.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
        {
          title: "Lawn Restoration",
          url: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
      ],
      bank_name: "FNB",
      account_number: "7654321098765",
      branch_code: "250155",
      id_number: "9205201234567",
      preferred_categories: [],
    },
    "3": {
      id: "3",
      full_name: "Mike Electrician",
      email: "electrician@test.com",
      role: "worker" as const,
      location: "Johannesburg, Sandton",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      bio: "Licensed electrician with 12+ years experience. Specializing in residential and commercial wiring.",
      skills: [
        "Electrical Wiring",
        "Circuit Installation",
        "Safety Compliance",
        "LED Installation",
      ],
      hourly_rate: "250",
      portfolio: [
        {
          title: "Kitchen Rewiring",
          url: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
      ],
      bank_name: "Standard Bank",
      account_number: "1234567890123",
      branch_code: "051001",
      id_number: "8904151234567",
      preferred_categories: [],
    },
    "4": {
      id: "4",
      full_name: "Thabo N.",
      email: "thabo@test.com",
      role: "worker" as const,
      location: "Pretoria, Eastwood",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo",
      bio: "Expert plumber with 10+ years experience. Handles everything from basic repairs to complex installations.",
      skills: [
        "Plumbing",
        "Pipe Installation",
        "Leak Detection",
        "Bathroom Fitting",
      ],
      hourly_rate: "200",
      portfolio: [
        {
          title: "Bathroom Renovation",
          url: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600",
        },
      ],
      bank_name: "Capitec",
      account_number: "9876543210987",
      branch_code: "430000",
      id_number: "7805091234567",
      preferred_categories: [],
    },
  };

  const mockUsers = {
    "homeowner@test.com": {
      id: "1",
      full_name: "John Homeowner",
      email: "homeowner@test.com",
      role: "customer" as const,
      location: "Johannesburg, Northern Suburbs",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      preferred_categories: ["Electricians", "Plumbers", "Painters"],
    },
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setMessage(null);
      try {
        // Check if user is a worker
        let profile = getUserFromCookies();

        if (!profile) {
          setMessage({ type: "error", text: "User profile not found." });
          router.push("/auth/login");
          return;
        }

        setUser(profile);
        setFormData({
          id: profile.id,
          full_name: profile.first_name + " " + profile.last_name,
          email: profile.email,
          role: profile.role,
          location:
            profile.addresses[0].city + ", " + profile.addresses[0].province,
          avatar_url: getAvatarUrl(
            profile.first_name + " " + profile.last_name
          ),
          skills: profile.workers?.skills || [],
          bio: profile.workers?.bio || "",
          hourly_rate: profile.hourly_rate || "",
          portfolio: profile.portfolio || [],
          bank_name: profile.bank_name || "",
          account_number: profile.account_number || "",
          branch_code: profile.branch_code || "",
          id_number: profile.id_number || "",
          preferred_categories: profile.preferred_categories || [],
        });
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setMessage({
          type: "error",
          text: err.message || "Failed to load user profile.",
        });
        router.push("/auth/login"); // Redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleLogout = async () => {
    localStorage.removeItem("userEmail");
    router.push("/auth/login");
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setLoading(true);
      try {
        // For mock data, create a local URL instead of uploading to Supabase
        const fileReader = new FileReader();
        fileReader.onload = () => {
          setFormData((prev: any) => ({
            ...prev,
            avatar_url: fileReader.result as string,
          }));
          setMessage({ type: "success", text: "Avatar updated successfully!" });
          setLoading(false);
        };
        fileReader.readAsDataURL(file);
      } catch (error: any) {
        console.error("Error updating avatar:", error);
        setMessage({
          type: "error",
          text: error.message || "Failed to update avatar.",
        });
        setLoading(false);
      }
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData((prev: any) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev: any) => ({
      ...prev,
      skills: (prev.skills || []).filter((s: any) => s !== skill),
    }));
  };

  const handleAddCategory = () => {
    if (
      newCategory.trim() &&
      !formData.preferred_categories?.includes(newCategory.trim())
    ) {
      setFormData((prev: any) => ({
        ...prev,
        preferred_categories: [
          ...(prev.preferred_categories || []),
          newCategory.trim(),
        ],
      }));
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setFormData((prev: any) => ({
      ...prev,
      preferred_categories: (prev.preferred_categories || []).filter(
        (c: any) => c !== category
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!user) {
      setMessage({ type: "error", text: "User not authenticated." });
      setLoading(false);
      return;
    }

    try {
      // For mock data, just show success message
      // In a real app, this would update the Supabase database
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (message?.type === "error" && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: {message.text}</p>
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
      {/* --- Navbar --- */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={handleCancel}
            className="text-blue-600 dark:text-blue-400 flex items-center gap-1"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Cancel</span>
          </button>

          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            Edit Profile
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

      {/* --- Main Content --- */}
      <main className="flex-grow container mx-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={
                    formData.avatar_url ||
                    "https://ui-avatars.com/api/?name=User&background=random&color=fff"
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 shadow-md hover:bg-blue-700"
                  title="Change profile picture"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  aria-label="Change profile picture"
                  title="Change profile picture"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled // Email should not be editable here, it's from auth
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-not-allowed"
                />
              </div>
            </div>

            {/* Location — CRITICAL FOR JOB MATCHING */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Johannesburg, Sandton"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your location helps us recommend nearby jobs.
              </p>
            </div>

            {/* Worker-Specific Fields */}
            {isWorker && (
              <>
                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Tell customers about your experience..."
                  />
                </div>

                {/* Hourly Rate */}
                <div>
                  <label
                    htmlFor="hourlyRate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Hourly Rate (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      R
                    </span>
                    <input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourly_rate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hourly_rate: e.target.value,
                        })
                      }
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.skills || []).map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portfolio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio
                  </label>
                  {(formData.portfolio || []).map(
                    (item: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {item.title}
                        </a>
                      </div>
                    )
                  )}
                  {/* Add portfolio item form could be added here */}
                </div>
              </>
            )}

            {/* Customer-Specific Fields */}
            {!isWorker && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Job Categories
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Electricians"
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.preferred_categories || []).map(
                    (cat: any, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2.5 py-1 rounded-full text-sm"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat)}
                          className="ml-1 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          ×
                        </button>
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
