// app/about/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Users, MapPin, Star, Award, Briefcase, Rocket } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false); // Mock auth state

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleLogout = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Brinkify SA
          </Link>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          <button
            onClick={toggleMenu}
            className="md:hidden text-blue-600 dark:text-blue-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
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
              {loggedIn ? (
                <>
                  <button onClick={() => navigate('/profile/edit')} className="text-left text-lg font-medium">Edit Profile</button>
                  <button onClick={handleLogout} className="text-left text-lg font-medium">Log Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/auth/login')} className="text-left text-lg font-medium">Login</button>
                  <button onClick={() => navigate('/auth/signup')} className="text-left text-lg font-medium">Sign Up</button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              About Brinkify SA
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Brinkify SA (Pty) Ltd is a new-age platform that connects South Africa’s skilled workers and growing
              businesses with real, verified opportunities — empowering them to showcase their talent, grow their
              craft, and reach clients across all nine provinces.
            </p>
          </div>

          {/* Vision */}
          <section className="mb-16 text-center">
            <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
              <Rocket className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We envision a nation where every skilled individual and business has equal access to opportunities,
              visibility, and growth. Brinkify SA bridges the gap between talent and demand — building trust, creating
              jobs, and unlocking a sustainable digital economy for workers and companies alike.
            </p>
          </section>

          {/* Mission */}
          <section className="mb-16 text-center">
            <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              To empower South African workers and businesses by providing a trusted, digital space to connect, learn,
              and grow. We strive to give every user — from independent artisans to large-scale contractors —
              professional tools and verified exposure to reach their next level.
            </p>
          </section>

          {/* Core Values */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Opportunity', desc: 'Unlocking access to real clients, verified exposure, and endless possibilities for growth.' },
                { title: 'Trust & Transparency', desc: 'Every profile is verified — ensuring clients hire with confidence and workers build credibility.' },
                { title: 'Empowerment', desc: 'Helping South Africans turn their skills into sustainable careers.' },
                { title: 'Innovation', desc: 'Using technology to simplify hiring, communication, and reputation-building.' },
              ].map((value, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[
              { icon: MapPin, value: 'All 9 Provinces', label: 'Serving South Africa' },
              { icon: Star, value: '4.8/5', label: 'Average Worker Rating' },
              { icon: Award, value: '10K+', label: 'Jobs Completed' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </section>

          {/* Closing */}
          <section className="text-center mt-12">
            <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Why Choose Brinkify SA</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Because we care about your growth. Whether you’re an artisan, a business owner, or a developer, Brinkify SA
              provides a professional home to showcase your work, connect with real clients, and take your skills or
              company to the next level.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-6 text-center">
        <div className="container mx-auto px-4">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Brinkify SA</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            © {new Date().getFullYear()} Brinkify SA (Pty) Ltd — Connecting South Africa’s skilled workforce and businesses with real opportunities.
          </p>
        </div>
      </footer>
    </div>
  );
}
