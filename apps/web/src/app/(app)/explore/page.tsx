// app/explore/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Heart, MessageCircle, MapPin, User } from 'lucide-react';

// 🔒 Mock feed posts (like Instagram for trades)
const MOCK_FEED_POSTS = [
  {
    id: 'post_1',
    worker: { id: 'w1', name: 'Thabo N.', avatar: 'https://ui-avatars.com/api/?name=Thabo+N&background=4F46E5&color=fff' },
    title: 'Kitchen Rewiring Complete',
    category: 'Electricians',
    location: 'Johannesburg, Sandton',
    description: 'Upgraded old wiring, added 3 new outlets, and installed LED lighting. All compliant with SANS 10142.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600',
      'https://images.unsplash.com/photo-1581578021424-eb98b87c2c65?auto=format&fit=crop&w=600',
    ],
    likes: 24,
    comments: 3,
    createdAt: '2025-10-20',
  },
  {
    id: 'post_2',
    worker: { id: 'w2', name: 'Lerato P.', avatar: 'https://ui-avatars.com/api/?name=Lerato+P&background=F59E0B&color=fff' },
    title: 'Garden Makeover',
    category: 'Gardeners',
    location: 'Durban, Umhlanga',
    description: 'Complete lawn restoration, hedge trimming, and new flower beds installed. Client loved the result!',
    images: [
      'https://images.unsplash.com/photo-1506780488710-c3f390da9f4e?auto=format&fit=crop&w=600',
      'https://images.unsplash.com/photo-1506260459315-9c4c96d6d568?auto=format&fit=crop&w=600',
    ],
    likes: 42,
    comments: 7,
    createdAt: '2025-10-22',
  },
  {
    id: 'post_3',
    worker: { id: 'w3', name: 'James B.', avatar: 'https://ui-avatars.com/api/?name=James+B&background=8B5CF6&color=fff' },
    title: 'Bedroom Painting',
    category: 'Painters',
    location: 'Pretoria, Hatfield',
    description: 'Fresh coat of Dulux Satin in Classic White. Walls prepped, taped, and finished with clean lines.',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5384259?auto=format&fit=crop&w=600',
    ],
    likes: 18,
    comments: 2,
    createdAt: '2025-10-24',
  },
  {
    id: 'post_4',
    worker: { id: 'w4', name: 'Sipho M.', avatar: 'https://ui-avatars.com/api/?name=Sipho+M&background=10B981&color=fff' },
    title: 'Bathroom Tiling',
    category: 'Tilers',
    location: 'Cape Town, Claremont',
    description: 'Full wall and floor tiling with anti-slip porcelain tiles. Waterproofing applied before installation.',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5384259?auto=format&fit=crop&w=600',
      'https://images.unsplash.com/photo-1581578021424-eb98b87c2c65?auto=format&fit=crop&w=600',
    ],
    likes: 31,
    comments: 5,
    createdAt: '2025-10-25',
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const openPrivacy = () => window.open('https://brinkifysa.co.za/privacy', '_blank');
  const openTerms = () => window.open('https://brinkifysa.co.za/terms', '_blank');
  const openContact = () => (window.location.href = 'mailto:support@brinkifysa.co.za');

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
          {MOCK_FEED_POSTS.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Worker Header */}
              <div className="p-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
                <img
                  src={post.worker.avatar}
                  alt={post.worker.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">{post.worker.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location}</span>
                  </div>
                </div>
                <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{post.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{post.description}</p>

                {/* Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {post.images.map((img, i) => (
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
          ))}

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
            © {new Date().getFullYear()} Brinkify SA. Empowering South Africa’s skilled workforce and growing businesses.
          </p>
          <div className="space-x-4 mt-3">
            <button onClick={openTerms} className="text-blue-600 dark:text-blue-400 hover:underline">Terms</button>
            <span>•</span>
            <button onClick={openPrivacy} className="text-blue-600 dark:text-blue-400 hover:underline">Privacy</button>
            <span>•</span>
            <button onClick={openContact} className="text-blue-600 dark:text-blue-400 hover:underline">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}