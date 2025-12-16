"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { createClient as createSupabaseBrowserClient } from "@/utils/supabase/client";
import {
  Heart,
  MessageCircle,
  MapPin,
  Search,
  Filter,
  Share2,
  Star,
  TrendingUp,
  Bookmark,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Banknote,
  CheckCircle,
  X,
  Menu,
  Home,
  Zap,
  Users,
  MoreVertical,
} from "lucide-react";

// Types for API data
interface Poster {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  role?: string | null;
}

interface FeedJob {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  min_budget?: number | null;
  max_budget?: number | null;
  created_at: string;
  images: string[];
  owner_id: string;
  worker_id?: string | null;
  status: string;
  owner?: Poster | null;
  likesCount?: number;
  commentsCount?: number;
  userLiked?: boolean;
}

export default function FeedPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"recent" | "trending">("recent");
  const [currentImageIndex, setCurrentImageIndex] = useState<{
    [key: string]: number;
  }>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [posts, setPosts] = useState<FeedJob[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<FeedJob | null>(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  // Updated category list to match post categories
  const categories = [
    "All",
    "Carpentry",
    "Electrical",
    "Tiling",
    "Plumbing",
    "General Contracting",
    "Renewable Energy",
  ];

  // Fetch jobs from server feed API and subscribe to realtime updates
  useEffect(() => {
    let mounted = true;

    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/feed", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch feed");
        const data: FeedJob[] = await res.json();
        if (!mounted) return;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading feed jobs:", err);
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    };

    fetchJobs();

    // Realtime subscription for jobs changes
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("jobs-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        () => {
          // Re-fetch to keep owner info in sync
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredPosts = posts
    .filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.owner?.full_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "trending") {
        // Fallback to recent if we don't have metrics
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const toggleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch(`/api/jobs/${postId}/likes`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to toggle like');
      
      const { liked } = await res.json();
      
      // Update local state
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            userLiked: liked,
            likesCount: (p.likesCount || 0) + (liked ? 1 : -1),
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
      alert('Please log in to like posts');
    }
  };

  const toggleSave = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = new Set(savedPosts);
    if (newSaved.has(postId)) {
      newSaved.delete(postId);
    } else {
      newSaved.add(postId);
    }
    setSavedPosts(newSaved);
  };

  const nextImage = (
    postId: string,
    imageCount: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % imageCount,
    }));
  };

  const prevImage = (
    postId: string,
    imageCount: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + imageCount) % imageCount,
    }));
  };

  const handleLogout = () => {
    router.push("/auth/login");
  };

  const openComments = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedJobId(postId);
    setCommentModalOpen(true);
    
    // Fetch comments
    try {
      const res = await fetch(`/api/jobs/${postId}/comments`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch comments');
      const { data } = await res.json();
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !selectedJobId) return;
    
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJobId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment.trim() }),
      });
      
      if (!res.ok) throw new Error('Failed to post comment');
      const { data } = await res.json();
      
      setComments(prev => [data, ...prev]);
      setNewComment("");
      
      // Update comment count
      setPosts(prev => prev.map(p => {
        if (p.id === selectedJobId) {
          return { ...p, commentsCount: (p.commentsCount || 0) + 1 };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment. Please log in.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleMessageOwner = async (ownerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!ownerId) {
      alert('Job owner not available');
      return;
    }

    try {
      // Create or find existing chat with the owner
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: ownerId }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert('Please log in to send messages');
          return;
        }
        throw new Error('Failed to create conversation');
      }
      
      const { data } = await res.json();
      
      // Navigate to the chat
      router.push(`/messages/${data.id}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      alert('Failed to start conversation');
    }
  };

  const openJobDetails = (job: FeedJob, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedJob(job);
    setDetailImageIndex(0);
    setJobDetailsModalOpen(true);
  };

  const nextDetailImage = () => {
    if (selectedJob && selectedJob.images.length > 0) {
      setDetailImageIndex((prev) => (prev + 1) % selectedJob.images.length);
    }
  };

  const prevDetailImage = () => {
    if (selectedJob && selectedJob.images.length > 0) {
      setDetailImageIndex((prev) => (prev - 1 + selectedJob.images.length) % selectedJob.images.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-blue-600 dark:text-blue-400"
          >
            BrinkifySA Feed
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
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <Search className="w-4 h-4" />
              <span>Explore</span>
            </button>
            <ModeToggle />
            <button
              onClick={handleLogout}
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
                navigate("/explore");
                setMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-blue-600"
            >
              Explore
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* SEARCH & FILTER SECTION */}
      <div className="sticky top-[60px] z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-4 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Individuals/ Companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Filter & Sort Controls */}
          {filterOpen && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    aria-label="Select category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sort By
                  </label>
                  <select
                    aria-label="Sort posts by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN FEED */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No projects found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const currentIdx = currentImageIndex[post.id] || 0;
              const isLiked = likedPosts.has(post.id);
              const isSaved = savedPosts.has(post.id);

              return (
                <Link
                  key={post.id}
                  href={`/jobs/${post.id}`}
                  className="block"
                >
                  <div className="group h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                    {/* Image Section with Gallery */}
                    <div className="relative h-64 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 overflow-hidden flex items-center justify-center">
                      <img
                        src={post.images?.[currentIdx] || 
                          `https://via.placeholder.com/600x400?text=${encodeURIComponent(post.title)}`}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(
                            post.title
                          )}`;
                        }}
                      />

                      {/* Image Counter */}
                      {post.images && post.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-full text-white text-xs font-medium">
                          {currentIdx + 1}/{post.images.length}
                        </div>
                      )}

                      {/* Image Navigation */}
                      {post.images && post.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) =>
                              prevImage(post.id, post.images.length, e)
                            }
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) =>
                              nextImage(post.id, post.images.length, e)
                            }
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Category Tag */}
                      <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </div>
                    </div>

                    {/* Poster Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.owner?.avatar_url || 
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.owner?.full_name || 'User')}`}
                            alt={post.owner?.full_name || 'User'}
                            className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              (
                                e.target as HTMLImageElement
                              ).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.owner?.full_name || 'User')}`;
                            }}
                          />
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                              {post.owner?.full_name || "Homeowner"}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {post.location}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => toggleSave(post.id, e)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Bookmark
                            className={`w-5 h-5 ${
                              isSaved ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(() => {
                          const d = post.created_at ? new Date(post.created_at) : null;
                          const valid = d && !Number.isNaN(d.getTime());
                          return valid ? `Posted on ${d!.toLocaleDateString()}` : "Posted recently";
                        })()}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {post.description}
                      </p>

                      {/* Project Details */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-2 rounded-lg">
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Banknote className="w-3 h-3" />
                            Budget
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {post.min_budget || post.max_budget
                              ? `${post.min_budget ? `R${post.min_budget}` : ""}${
                                  post.max_budget ? ` - R${post.max_budget}` : ""
                                }`
                              : "Price on request"}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-2 rounded-lg">
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Posted
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {(() => {
                              const d = post.created_at ? new Date(post.created_at) : null;
                              return d && !Number.isNaN(d.getTime()) ? d.toLocaleString() : "Recently";
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Stats with real counts */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                        <div className="py-2 px-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {post.likesCount || 0}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Heart className="w-3 h-3" />
                            Likes
                          </div>
                        </div>
                        <div className="py-2 px-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {post.commentsCount || 0}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Comments
                          </div>
                        </div>
                        <div className="py-2 px-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {isSaved ? 1 : 0}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Bookmark className="w-3 h-3" />
                            Saves
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={(e) => toggleLike(post.id, e)}
                          className={`py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition text-sm ${
                            post.userLiked
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              post.userLiked ? "fill-current" : ""
                            }`}
                          />
                          Like
                        </button>
                        <button
                          onClick={(e) => openComments(post.id, e)}
                          className="py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-1 transition text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Comment
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className="py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 transition text-sm"
                          onClick={(e) => handleMessageOwner(post.owner_id, e)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                        <button
                          className="py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 transition text-sm"
                          onClick={(e) => openJobDetails(post, e)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* JOB DETAILS MODAL */}
      {jobDetailsModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
              <button
                onClick={() => setJobDetailsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image Gallery */}
              {selectedJob.images && selectedJob.images.length > 0 && (
                <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
                  <img
                    src={selectedJob.images[detailImageIndex]}
                    alt={selectedJob.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/800x600?text=${encodeURIComponent(selectedJob.title)}`;
                    }}
                  />
                  {selectedJob.images.length > 1 && (
                    <>
                      <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-white text-sm font-medium">
                        {detailImageIndex + 1}/{selectedJob.images.length}
                      </div>
                      <button
                        onClick={prevDetailImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextDetailImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Job Owner */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <img
                  src={
                    selectedJob.owner?.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      selectedJob.owner?.full_name || 'User'
                    )}`
                  }
                  alt={selectedJob.owner?.full_name || 'User'}
                  className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{selectedJob.owner?.full_name || 'Homeowner'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedJob.location}
                  </p>
                </div>
                <button
                  onClick={(e) => handleMessageOwner(selectedJob.owner_id, e)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              </div>

              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
                  {selectedJob.category}
                </span>
                <span className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-medium">
                  Status: {selectedJob.status}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedJob.description}
                </p>
              </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Banknote className="w-4 h-4" />
                    Budget
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedJob.min_budget || selectedJob.max_budget
                      ? `${selectedJob.min_budget ? `R${selectedJob.min_budget}` : ""}${
                          selectedJob.max_budget ? ` - R${selectedJob.max_budget}` : ""
                        }`
                      : "Price on request"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4" />
                    Posted
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {(() => {
                      const d = selectedJob.created_at ? new Date(selectedJob.created_at) : null;
                      return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : "Recently";
                    })()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4" />
                    Likes
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedJob.likesCount || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4" />
                    Comments
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedJob.commentsCount || 0}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(selectedJob.id, e);
                  }}
                  className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                    selectedJob.userLiked
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${selectedJob.userLiked ? "fill-current" : ""}`} />
                  {selectedJob.userLiked ? "Liked" : "Like"}
                </button>
                <button
                  onClick={(e) => {
                    setJobDetailsModalOpen(false);
                    openComments(selectedJob.id, e);
                  }}
                  className="py-3 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  Comment
                </button>
                <button
                  onClick={() => router.push(`/jobs/${selectedJob.id}`)}
                  className="py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition"
                >
                  <Eye className="w-5 h-5" />
                  Full Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMMENT MODAL */}
      {commentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">Comments</h2>
              <button
                onClick={() => setCommentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={
                        comment.profiles?.avatar_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          comment.profiles?.full_name || 'User'
                        )}`
                      }
                      alt={comment.profiles?.full_name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <p className="font-medium text-sm">
                          {comment.profiles?.full_name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !submittingComment && submitComment()}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={submittingComment}
                />
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            © {new Date().getFullYear()} Brinkify SA. Empowering South Africa's
            skilled workforce.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms
            </button>
            <span>•</span>
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy
            </button>
            <span>•</span>
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
