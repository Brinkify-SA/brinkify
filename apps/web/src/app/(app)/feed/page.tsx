'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Heart, MessageCircle, MapPin, Search, Filter, Share2, Star, 
  TrendingUp, Bookmark, Eye, ChevronLeft, ChevronRight, Clock,
  DollarSign, CheckCircle, X, Menu, Home, Zap, Users, MoreVertical
} from 'lucide-react';

// 🔒 Enhanced Mock Feed Posts
const MOCK_FEED_POSTS = [
  {
    id: 'post_1',
    worker: { id: '4', name: 'Thabo N.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo', rating: 4.9, reviews: 32 },
    title: 'Kitchen Rewiring Complete',
    category: 'Electricians',
    location: 'Johannesburg, Sandton',
    description: 'Upgraded old wiring, added 3 new outlets, and installed LED lighting. All compliant with SANS 10142. Project took 3 days and client was very satisfied with the quality.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600',
      'https://images.unsplash.com/photo-1581578021424-eb98b87c2c65?auto=format&fit=crop&w=600',
    ],
    likes: 128,
    comments: 24,
    views: 456,
    saves: 32,
    createdAt: '2025-10-20',
    completionTime: '3 days',
    price: 'R 2,500',
    verified: true,
    tags: ['electrical', 'wiring', 'led'],
  },
  {
    id: 'post_2',
    worker: { id: '2', name: 'Sarah Worker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', rating: 4.8, reviews: 24 },
    title: 'Garden Makeover',
    category: 'Gardeners',
    location: 'Cape Town, Southern Suburbs',
    description: 'Complete lawn restoration, hedge trimming, and new flower beds installed. Client loved the result! Beautiful transformation from bare patch to thriving green space.',
    images: [
      'https://images.unsplash.com/photo-1506780488710-c3f390da9f4e?auto=format&fit=crop&w=600',
      'https://images.unsplash.com/photo-1506260459315-9c4c96d6d568?auto=format&fit=crop&w=600',
    ],
    likes: 215,
    comments: 47,
    views: 892,
    saves: 156,
    createdAt: '2025-10-22',
    completionTime: '2 days',
    price: 'R 1,800',
    verified: true,
    tags: ['gardening', 'landscaping', 'lawn'],
  },
  {
    id: 'post_3',
    worker: { id: '3', name: 'Mike Electrician', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', rating: 4.6, reviews: 18 },
    title: 'Bedroom Painting',
    category: 'Painters',
    location: 'Johannesburg, Sandton',
    description: 'Fresh coat of Dulux Satin in Classic White. Walls prepped, taped, and finished with clean lines. Professional finish with attention to detail.',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5384259?auto=format&fit=crop&w=600',
    ],
    likes: 94,
    comments: 12,
    views: 301,
    saves: 28,
    createdAt: '2025-10-24',
    completionTime: '1 day',
    price: 'R 950',
    verified: true,
    tags: ['painting', 'interior', 'bedroom'],
  },
  {
    id: 'post_4',
    worker: { id: '4', name: 'Thabo N.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo', rating: 4.9, reviews: 32 },
    title: 'Bathroom Tiling',
    category: 'Tilers',
    location: 'Pretoria, Eastwood',
    description: 'Full wall and floor tiling with anti-slip porcelain tiles. Waterproofing applied before installation. Premium finish with perfect grouting.',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5384259?auto=format&fit=crop&w=600',
      'https://images.unsplash.com/photo-1581578021424-eb98b87c2c65?auto=format&fit=crop&w=600',
    ],
    likes: 167,
    comments: 31,
    views: 623,
    saves: 89,
    createdAt: '2025-10-25',
    completionTime: '4 days',
    price: 'R 3,200',
    verified: true,
    tags: ['tiling', 'bathroom', 'waterproofing'],
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

  const categories = ['All', 'Electricians', 'Gardeners', 'Painters', 'Tilers', 'Plumbers'];

  const filteredPosts = MOCK_FEED_POSTS.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'trending') return b.views - a.views;
    if (sortBy === 'top-rated') return b.likes - a.likes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const toggleLike = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
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
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % imageCount
    }));
  };

  const prevImage = (postId: string, imageCount: number, e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + imageCount) % imageCount
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/auth/login');
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
                placeholder="Search projects, workers..."
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
                <Link key={post.id} href={`/profile/${post.worker.id}`}>
                  <div className="group h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer">
                    {/* Image Section with Gallery */}
                    <div className="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img
                        src={post.images[currentIdx]}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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

                      {/* Verified Badge */}
                      {post.verified && (
                        <div className="absolute top-3 left-3 bg-green-500 px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
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
                            <DollarSign className="w-3 h-3" />
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
                        <button className="flex-1 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition">
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Message</span>
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
