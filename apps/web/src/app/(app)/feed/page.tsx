'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Heart, MessageCircle, MapPin, Search, Filter, Share2, Star, 
  TrendingUp, Bookmark, Eye, ChevronLeft, ChevronRight, Clock,
  Banknote, CheckCircle, X, Menu, Home, Zap, Users, MoreVertical
} from 'lucide-react';

// 🔹 Define TypeScript interfaces
interface Worker {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
}

interface Profile extends Worker {
  type: 'worker' | 'company';
  verified: boolean;
  category: string;
  location: string;
  bio: string;
}

interface FeedPost {
  id: string;
  workerId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  images: string[];
  tags: string[];
  price: string;
  completionTime: string;
  likes: number;
  comments: number;
  saves: number;
  views: number;
  createdAt: string;
  verified: boolean;
  worker: Worker;
}

// 🔒 Worker subscription tiers — now using profile IDs (e.g., 'w-101')
const WORKER_SUBSCRIPTIONS: { [key: string]: 'basic' | 'premium' | 'elite' } = {
  'w-101': 'elite',    // Thabo Mthembu
  'w-102': 'premium',  // Naledi Khubone
  'w-103': 'basic',    // Sarah Nkosi
  'w-104': 'premium',  // Kagiso Molefe
  'w-105': 'elite',    // Lerato Dlamini
  'w-106': 'basic',    // Amahle Zwane
};

// 🔒 Mock Profiles
const MOCK_PROFILES: Profile[] = [
  {
    id: "w-101",
    type: "worker",
    name: "Thabo Mthembu",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Thabo",
    verified: true,
    rating: 4.9,
    reviews: 47,
    category: "Carpentry",
    location: "Pretoria, Gauteng",
    bio: "Expert carpenter specializing in cabinetry and deck construction.",
  },
  {
    id: "w-102",
    type: "worker",
    name: "Naledi Khubone",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Naledi",
    verified: true,
    rating: 4.8,
    reviews: 63,
    category: "Electrical",
    location: "Johannesburg, Gauteng",
    bio: "Certified electrician: rewiring, solar setups, and safe installations.",
  },
  {
    id: "w-103",
    type: "worker",
    name: "Sarah Nkosi",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah",
    verified: false,
    rating: 4.5,
    reviews: 12,
    category: "Tiling",
    location: "Durban, KZN",
    bio: "Tiling specialist for bathrooms and outdoor areas.",
  },
  {
    id: "c-201",
    type: "company",
    name: "BrightHome Contractors",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BrightHome",
    verified: true,
    rating: 4.7,
    reviews: 128,
    category: "General Contracting",
    location: "Cape Town, Western Cape",
    bio: "Full-service home contracting company: renovations, electrical, plumbing.",
  },
  {
    id: "w-104",
    type: "worker",
    name: "Kagiso Molefe",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Kagiso",
    verified: true,
    rating: 4.8,
    reviews: 55,
    category: "Plumbing",
    location: "Pretoria, Gauteng",
    bio: "Emergency and maintenance plumbing services.",
  },
  {
    id: "c-202",
    type: "company",
    name: "EcoSolar Installations",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EcoSolar",
    verified: false,
    rating: 4.6,
    reviews: 34,
    category: "Renewable Energy",
    location: "Stellenbosch, Western Cape",
    bio: "Solar panel and battery system installers for homes and small businesses.",
  },
  {
    id: "w-105",
    type: "worker",
    name: "Lerato Dlamini",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Lerato",
    verified: true,
    rating: 4.9,
    reviews: 71,
    category: "Tiling",
    location: "Durban, KZN",
    bio: "Precision tiler with waterproofing experience.",
  },
  {
    id: "w-106",
    type: "worker",
    name: "Amahle Zwane",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Amahle",
    verified: false,
    rating: 4.7,
    reviews: 44,
    category: "Carpentry",
    location: "Randburg, Gauteng",
    bio: "Decks and outdoor structures specialist.",
  },
];

// 🔒 Mock Feed Posts — now properly defined
const MOCK_FEED_POSTS: FeedPost[] = [
  {
    id: "post-1",
    workerId: "w-101",
    title: "Custom Wooden Deck Installation",
    description: "Built a stunning 50m² hardwood deck with integrated lighting and safety rails for a family home in Waterkloof.",
    category: "Carpentry",
    location: "Pretoria, Gauteng",
    images: [
      "https://images.unsplash.com/photo-1600585154084-4e5b76719a23?auto=format&fit=crop&w=600&h=400",
      "https://images.unsplash.com/photo-1590490355227-8e9c11d6d682?auto=format&fit=crop&w=600&h=400",
    ],
    tags: ["deck", "outdoor", "custom", "wood"],
    price: "R12,500",
    completionTime: "3 weeks",
    likes: 24,
    comments: 8,
    saves: 15,
    views: 320,
    createdAt: "2025-10-15T10:00:00Z",
    verified: true,
    worker: {
      id: "w-101",
      name: "Thabo Mthembu",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Thabo",
      rating: 4.9,
      reviews: 47,
    },
  },
  {
    id: "post-2",
    workerId: "w-102",
    title: "Full Home Rewiring & Solar Setup",
    description: "Complete electrical overhaul with solar battery integration for off-grid capability in a suburban home.",
    category: "Electrical",
    location: "Johannesburg, Gauteng",
    images: [
      "https://images.unsplash.com/photo-1607195770388-6c65d5e75694?auto=format&fit=crop&w=600&h=400",
    ],
    tags: ["solar", "rewiring", "smart-home", "energy"],
    price: "R45,000",
    completionTime: "6 weeks",
    likes: 38,
    comments: 12,
    saves: 22,
    views: 510,
    createdAt: "2025-10-20T14:30:00Z",
    verified: true,
    worker: {
      id: "w-102",
      name: "Naledi Khubone",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Naledi",
      rating: 4.8,
      reviews: 63,
    },
  },
  {
    id: "post-3",
    workerId: "w-105",
    title: "Luxury Bathroom Tiling",
    description: "Full bathroom renovation with premium porcelain tiles and waterproofing in Umhlanga.",
    category: "Tiling",
    location: "Durban, KZN",
    images: [
      "https://images.unsplash.com/photo-1551695361-2a7e3d31e540?auto=format&fit=crop&w=600&h=400",
      "https://images.unsplash.com/photo-1584622650111-983b4015a2c8?auto=format&fit=crop&w=600&h=400",
    ],
    tags: ["bathroom", "tiling", "waterproof", "luxury"],
    price: "R8,200",
    completionTime: "10 days",
    likes: 31,
    comments: 7,
    saves: 19,
    views: 280,
    createdAt: "2025-11-01T09:15:00Z",
    verified: true,
    worker: {
      id: "w-105",
      name: "Lerato Dlamini",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Lerato",
      rating: 4.9,
      reviews: 71,
    },
  },
  {
    id: "post-4",
    workerId: "w-104",
    title: "Emergency Pipe Burst Repair",
    description: "24/7 emergency service: fixed burst geyser pipe and prevented major water damage.",
    category: "Plumbing",
    location: "Pretoria, Gauteng",
    images: [
      "https://images.unsplash.com/photo-1610715352658-bcd9c43a0e89?auto=format&fit=crop&w=600&h=400",
    ],
    tags: ["emergency", "plumbing", "geyser", "repair"],
    price: "R1,800",
    completionTime: "Same day",
    likes: 18,
    comments: 5,
    saves: 8,
    views: 150,
    createdAt: "2025-11-10T18:45:00Z",
    verified: true,
    worker: {
      id: "w-104",
      name: "Kagiso Molefe",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Kagiso",
      rating: 4.8,
      reviews: 55,
    },
  },
];

export default function FeedPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'top-rated'>('recent');
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isHomeowner, setIsHomeowner] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>(MOCK_FEED_POSTS);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Updated category list to match post categories
  const categories = [
    'All',
    'Carpentry',
    'Electrical',
    'Tiling',
    'Plumbing',
    'General Contracting',
    'Renewable Energy'
  ];

  // Check user type on mount
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
    setIsHomeowner(email ? !email.includes('worker') : false);
  }, []);

  // Fetch jobs from server feed API
  useEffect(() => {
    let mounted = true;
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/feed');
        if (!res.ok) throw new Error('Failed to fetch feed');
        const data = await res.json();
        if (!mounted) return;
        // Map API shape to FeedPost shape (best-effort)
        const mapped: FeedPost[] = data.map((j: any) => ({
          id: j.id,
          workerId: j.user?.id || j.customer_id || 'unknown',
          title: j.title,
          description: j.description,
          category: j.category,
          location: j.location,
          images: Array.isArray(j.images) ? j.images : [],
          tags: [],
          price: j.min_budget || j.max_budget ? `R${j.min_budget || ''}${j.max_budget ? ' - R' + j.max_budget : ''}` : 'Price on request',
          completionTime: '',
          likes: 0,
          comments: 0,
          saves: 0,
          views: 0,
          createdAt: j.created_at || new Date().toISOString(),
          verified: false,
          worker: {
            id: j.user?.id || j.customer_id || 'unknown',
            name: j.user?.full_name || 'Anonymous',
            avatar: j.user?.avatar_url || '/default-avatar.png',
            rating: 0,
            reviews: 0,
          }
        }));
        setPosts(mapped);
      } catch (err) {
        console.error('Error loading feed jobs:', err);
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    };
    fetchJobs();
    return () => { mounted = false; };
  }, []);

  const getSubscriptionTier = (workerId: string): number => {
    const tier = WORKER_SUBSCRIPTIONS[workerId] || 'basic';
    const tierRanking = { 'elite': 3, 'premium': 2, 'basic': 1 };
    return tierRanking[tier];
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // Primary sort: by subscription tier (higher tier first)
    const tierDiff = getSubscriptionTier(b.workerId) - getSubscriptionTier(a.workerId);
    if (tierDiff !== 0) return tierDiff;
    
    // Secondary sort: by selected sort criteria
    if (sortBy === 'trending') return b.views - a.views;
    if (sortBy === 'top-rated') return (b.worker.rating * b.worker.reviews) - (a.worker.rating * a.worker.reviews);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const toggleLike = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
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

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/auth/login');
  };

  const contactWorker = (post: FeedPost) => {
    if (!isHomeowner) {
      alert('Only homeowners can contact workers');
      return;
    }

    if (!userEmail) {
      alert('Please log in first');
      return;
    }

    // Create conversation with worker
    const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const initialMsg = `Hi ${post.worker.name}, I'm interested in your "${post.title}" service. Can we discuss this?`;

    interface HelpRequestConversation {
      id: string;
      created_at: string;
      requester_email: string;
      responder_email: string;
      help_request_id: string;
      help_request_title: string;
      last_message_text?: string;
    }

    interface Message {
      id: string;
      created_at: string;
      conversation_id: string;
      sender_email: string;
      text: string;
    }

    const newConversation: HelpRequestConversation = {
      id: convId,
      created_at: new Date().toISOString(),
      requester_email: userEmail,
      responder_email: post.worker.id,
      help_request_id: post.id,
      help_request_title: post.title,
      last_message_text: initialMsg,
    };

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      created_at: new Date().toISOString(),
      conversation_id: convId,
      sender_email: userEmail,
      text: initialMsg,
    };

    // Save to localStorage
    const rawConvs = localStorage.getItem('conversations');
    let conversations: HelpRequestConversation[] = [];
    if (rawConvs) {
      try {
        conversations = JSON.parse(rawConvs);
      } catch (e) {
        console.warn('Invalid conversations');
      }
    }

    const rawMsgs = localStorage.getItem('help_request_messages');
    let messages: Message[] = [];
    if (rawMsgs) {
      try {
        messages = JSON.parse(rawMsgs);
      } catch (e) {
        console.warn('Invalid messages');
      }
    }

    conversations.push(newConversation);
    messages.push(newMsg);
    localStorage.setItem('conversations', JSON.stringify(conversations));
    localStorage.setItem('help_request_messages', JSON.stringify(messages));

    // Navigate to chat
    router.push(`/messages/${convId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              BrinkifySA Feed
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button onClick={() => navigate('/explore')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <Search className="w-4 h-4" />
              <span>Explore</span>
            </button>
            <ModeToggle />
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition">
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
            <button onClick={() => { navigate('/dashboard'); setMenuOpen(false); }} className="block w-full text-left py-2 hover:text-blue-600">Dashboard</button>
            <button onClick={() => { navigate('/explore'); setMenuOpen(false); }} className="block w-full text-left py-2 hover:text-blue-600">Explore</button>
            <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-medium">Logout</button>
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
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    aria-label="Select category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    aria-label="Sort posts by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="trending">Trending</option>
                    <option value="top-rated">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const currentIdx = currentImageIndex[post.id] || 0;
              const isLiked = likedPosts.has(post.id);
              const isSaved = savedPosts.has(post.id);

              return (
                <Link key={post.id} href={`/profile/${post.worker.id}`} className="block">
                  <div className="group h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                    {/* Image Section with Gallery */}
                    <div className="relative h-64 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 overflow-hidden flex items-center justify-center">
                      <img
                        src={post.images[currentIdx]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(post.title)}`;
                        }}
                      />

                      {/* Image Counter */}
                      {post.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-full text-white text-xs font-medium">
                          {currentIdx + 1}/{post.images.length}
                        </div>
                      )}

                      {/* Image Navigation */}
                      {post.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => prevImage(post.id, post.images.length, e)}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => nextImage(post.id, post.images.length, e)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Verified Badge with Subscription Tier Color */}
                      {post.verified && (
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1 ${
                          WORKER_SUBSCRIPTIONS[post.workerId] === 'elite' ? 'bg-green-500' :
                          WORKER_SUBSCRIPTIONS[post.workerId] === 'premium' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}>
                          <CheckCircle className="w-3 h-3" />
                          {WORKER_SUBSCRIPTIONS[post.workerId] === 'elite' ? 'Verified Elite' :
                           WORKER_SUBSCRIPTIONS[post.workerId] === 'premium' ? 'Verified Pro' :
                           'Verified'}
                        </div>
                      )}

                      {/* Category Tag */}
                      <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </div>
                    </div>

                    {/* Worker Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.worker.avatar}
                            alt={post.worker.name}
                            className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.worker.name)}`;
                            }}
                          />
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                              {post.worker.name}
                            </h3>
                            <div className="flex items-center gap-1 text-yellow-500 text-sm">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{post.worker.rating}</span>
                              <span className="text-gray-600 dark:text-gray-400">({post.worker.reviews})</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={(e) => toggleSave(post.id, e)} className="text-gray-400 hover:text-red-500 transition">
                          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location}
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

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-2 rounded-lg">
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Completed in
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{post.completionTime}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-2 rounded-lg">
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Banknote className="w-3 h-3" />
                            Cost
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{post.price}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
                        <div className="py-2 px-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="font-bold text-gray-900 dark:text-white">{post.views}</div>
                          <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Eye className="w-3 h-3" />
                            Views
                          </div>
                        </div>
                        <div className="py-2 px-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="font-bold text-gray-900 dark:text-white">{post.likes + (isLiked ? 1 : 0)}</div>
                          <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Heart className="w-3 h-3" />
                            Likes
                          </div>
                        </div>
                        <div className="py-2 px-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="font-bold text-gray-900 dark:text-white">{post.comments}</div>
                          <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Comments
                          </div>
                        </div>
                        <div className="py-2 px-1 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <div className="font-bold text-gray-900 dark:text-white">{post.saves + (isSaved ? 1 : 0)}</div>
                          <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                            <Bookmark className="w-3 h-3" />
                            Saves
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => toggleLike(post.id, e)}
                          className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                            isLiked
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                          {isLiked ? 'Liked' : 'Like'}
                        </button>
                        {isHomeowner ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              contactWorker(post);
                            }}
                            className="flex-1 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Contact</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 rounded-lg font-medium bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed"
                            title="Only homeowners can contact workers"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Contact</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            © {new Date().getFullYear()} Brinkify SA. Empowering South Africa's skilled workforce.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <button className="text-blue-600 dark:text-blue-400 hover:underline">Terms</button>
            <span>•</span>
            <button className="text-blue-600 dark:text-blue-400 hover:underline">Privacy</button>
            <span>•</span>
            <button className="text-blue-600 dark:text-blue-400 hover:underline">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}