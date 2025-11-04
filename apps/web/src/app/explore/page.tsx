// app/explore/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';

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

  const categories = [
    { id: 'electricians', name: 'Electricians', icon: '⚡', color: 'from-yellow-400 to-orange-500' },
    { id: 'plumbers', name: 'Plumbers', icon: '💧', color: 'from-blue-400 to-cyan-500' },
    { id: 'carpenters', name: 'Carpenters', icon: '🪚', color: 'from-amber-600 to-amber-800' },
    { id: 'painters', name: 'Painters', icon: '🎨', color: 'from-purple-400 to-pink-500' },
    { id: 'handymen', name: 'Handymen', icon: '🛠️', color: 'from-gray-500 to-gray-700' },
    { id: 'gardeners', name: 'Gardeners', icon: '🌿', color: 'from-green-400 to-emerald-600' },
    { id: 'cleaners', name: 'Cleaners', icon: '🧹', color: 'from-indigo-400 to-blue-600' },
    { id: 'tilers', name: 'Tilers', icon: '🧱', color: 'from-stone-500 to-stone-700' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
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

      {/* HERO BANNER */}
      <section className="relative py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-6">
            Discover Trusted Talent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            South Africa’s skilled professionals are just a tap away — verified, rated, and ready to work.
          </p>
        </div>
      </section>

      {/* WHY BRINKIFY SA SECTION */}
      <section className="bg-white dark:bg-gray-800 py-12 px-6 text-center border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Why Choose Brinkify SA?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Brinkify SA (Pty) Ltd is built to unlock access to real clients, verified exposure, and lasting growth for both workers and companies. 
            We bring South Africa’s talent to the digital stage — connecting you with jobs, trusted professionals, and opportunities that matter.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Verified & Rated', desc: 'All professionals are verified for identity and reputation, ensuring safe and reliable hiring.' },
              { title: 'Local First', desc: 'We connect homeowners and businesses with nearby talent — supporting community-based growth.' },
              { title: 'Empowerment', desc: 'Brinkify SA gives workers the digital tools they need to grow their income and showcase their craft.' },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-gray-50 dark:bg-gray-700/40 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <main className="flex-grow pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-8">
            Explore Skilled Professionals
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => navigate(`/explore/${category.id}`)}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer transform hover:-translate-y-1"
              >
                <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <div
              onClick={() => navigate('/auth/worker-register')}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition cursor-pointer"
            >
              Join Brinkify — Get Discovered Today
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
              Build your profile. Earn reviews. Grow your business.
            </p>
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

      {/* BLOBS */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 12s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
