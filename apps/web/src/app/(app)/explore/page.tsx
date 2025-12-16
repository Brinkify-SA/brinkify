// app/explore/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { createClient as createSupabaseBrowserClient } from "@/utils/supabase/client";
import { 
  Heart, MessageCircle, MapPin, User, Search, Filter, Share2, 
  Star, Award, TrendingUp, Bookmark, Eye, Download, ChevronLeft, 
  ChevronRight, Zap, Clock, DollarSign, CheckCircle, X, Banknote, Menu
} from 'lucide-react';

interface Poster {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  role?: string | null;
}

interface ExploreJob {
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
  worker?: Poster | null;
  likesCount?: number;
  commentsCount?: number;
  userLiked?: boolean;
}

export default function ExplorePage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'top-rated'>('recent');
  const [posts, setPosts] = useState<ExploreJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ExploreJob | null>(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  const categories = ['All', 'Carpentry', 'Electrical', 'Tiling', 'Plumbing', 'General Contracting', 'Renewable Energy'];

  // Fetch completed jobs from server explore API and subscribe to realtime updates
  useEffect(() => {
    let mounted = true;

    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/explore", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch explore");
        const data: ExploreJob[] = await res.json();
        if (!mounted) return;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading explore jobs:", err);
        setError((err as any)?.message || 'Failed to load completed jobs.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchJobs();

    // Realtime subscription for jobs changes
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("jobs-explore")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (post.worker?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'trending') return (b.likesCount || 0) - (a.likesCount || 0);
    if (sortBy === 'top-rated') return (b.likesCount || 0) - (a.likesCount || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const toggleMenu = () => setMenuOpen(!menuOpen);
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
    newSaved.has(postId) ? newSaved.delete(postId) : newSaved.add(postId);
    setSavedPosts(newSaved);
  };

  const nextImage = (postId: string, imageCount: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % imageCount
    }));
  };

  const prevImage = (postId: string, imageCount: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + imageCount) % imageCount
    }));
  };

  const openComments = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedJobId(postId);
    setCommentModalOpen(true);
    
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

  const handleMessageWorker = async (workerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!workerId) {
      alert('Worker not available');
      return;
    }

    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: workerId }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert('Please log in to send messages');
          return;
        }
        throw new Error('Failed to create conversation');
      }
      
      const { data } = await res.json();
      router.push(`/messages/${data.id}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      alert('Failed to start conversation');
    }
  };

  const openJobDetails = (job: ExploreJob, e: React.MouseEvent) => {
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* NAVBAR */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Brinkify SA
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => navigate('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Home
            </button>
            <button onClick={() => navigate('/auth/login')} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Login
            </button>
            <ModeToggle />
          </nav>
          <button
            onClick={toggleMenu}
            className="md:hidden text-blue-600 dark:text-blue-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={toggleMenu}></div>
          <div className="absolute left-0 top-0 h-full w-3/4 bg-blue-600 text-white p-6 pt-16">
            <button onClick={toggleMenu} className="absolute top-4 right-4 text-white" aria-label="Close menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="flex flex-col space-y-4 mt-6">
              <button onClick={() => navigate('/')} className="text-left text-lg font-medium">Home</button>
              <button onClick={() => navigate('/explore')} className="text-left text-lg font-medium">Explore</button>
              <button onClick={() => navigate('/about')} className="text-left text-lg font-medium">About Us</button>
              <button onClick={() => navigate('/auth/login')} className="text-left text-lg font-medium">Login</button>
              <button onClick={() => navigate('/auth/signup')} className="text-left text-lg font-medium">Sign Up</button>
            </nav>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Real Work. Real Talent.
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Scroll through projects completed by South Africa’s top verified professionals.
          </p>
        </div>
      </section>

      {/* FEED */}
      <main className="flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading completed projects...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-lg">
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No completed projects found.</p>
            </div>
          )}

          {!loading && filteredPosts.map((post) => {
            const images: string[] = Array.isArray(post.images) ? post.images : [];
            const workerObj = post.worker ?? { id: post.workerId ?? 'unknown', name: post.workerName ?? 'Worker', avatar: post.worker?.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.workerName ?? 'W')}`, rating: post.worker?.rating ?? 0 };
            const canManage = post.isLocal && post.createdByEmail && post.createdByEmail === localStorage.getItem('userEmail');

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
              >
              {/* Worker Header */}
              <div className="p-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
                <Link href={`/profile/${workerObj.id}`}>
                  <img
                    src={workerObj.avatar}
                    alt={workerObj.name}
                    className="w-10 h-10 rounded-full hover:opacity-80 cursor-pointer transition"
                  />
                </Link>
                <div>
                  <Link href={`/profile/${workerObj.id}`}>
                    <h3 className="font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition">
                      {workerObj.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location}</span>
                  </div>
                </div>
                <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full">
                  {post.category}
                </span>
                {canManage && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const raw = localStorage.getItem('feedPosts');
                      let feed = [] as any[];
                      if (raw) {
                        try { feed = JSON.parse(raw); } catch { feed = []; }
                      }
                      const remaining = feed.filter(p => p.id !== post.id);
                      localStorage.setItem('feedPosts', JSON.stringify(remaining));
                      setCompletedJobs(remaining);
                    }}
                    title="Delete post"
                    className="ml-3 text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Post Content */}
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{post.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{post.description}</p>

                {/* Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={img}
                        alt={`Project ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                  <span>{post.createdAt}</span>
                </div>
              </div>
            </div>
            );
          })}

          {/* CTA */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Want to Showcase Your Work?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join Brinkify SA and start sharing your projects with thousands of potential clients.
            </p>
            <button
              onClick={() => navigate('/auth/signup?role=worker')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition"
            >
              Sign Up as a Worker
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-8 text-center">
        <div className="container mx-auto px-4">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Brinkify SA</span>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            © {new Date().getFullYear()} Brinkify SA (Pty) Ltd. Connecting South Africa’s skilled workforce with real opportunities.
          </p>
          <div className="space-x-4 mt-3">
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}