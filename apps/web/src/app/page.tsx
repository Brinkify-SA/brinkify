// app/landing/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigateAndClose = (path: string) => {
    setMenuOpen(false);
    // @ts-expect-error
    router.push(path);
  };

  const openPrivacy = () => window.open('https://brinkifysa.co.za/privacy', '_blank');
  const openTerms = () => window.open('https://brinkifysa.co.za/terms', '_blank');
  const openContact = () => (window.location.href = 'mailto:support@brinkifysa.co.za');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Brinkify SA
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => navigateAndClose('/explore')} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Explore
            </button>
            <button onClick={() => navigateAndClose('/auth/login')} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
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
              <button onClick={() => navigateAndClose('/')} className="text-left text-lg font-medium">Home</button>
              <button onClick={() => navigateAndClose('/explore')} className="text-left text-lg font-medium">Explore</button>
              <button onClick={() => navigateAndClose('/about')} className="text-left text-lg font-medium">About Us</button>
              <button onClick={() => navigateAndClose('/auth/login')} className="text-left text-lg font-medium">Login</button>
              <button onClick={() => navigateAndClose('/auth/signup')} className="text-left text-lg font-medium">Sign Up</button>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="bg-white dark:bg-gray-950 py-16 md:py-24 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-block bg-blue-600 text-white font-bold text-3xl px-8 py-3 rounded-full mb-6">
              Brinkify SA
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Empowering South Africa’s Skilled Workforce & Growing Businesses
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
              A new-age platform built to connect verified professionals, contractors, and companies with real opportunities to grow, earn, and shine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigateAndClose('/auth/signup')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                ✅ Get Started Free
              </button>
              <button
                onClick={() => navigateAndClose('/auth/login')}
                className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 transition"
              >
                🔑 Log In
              </button>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900 text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">Why You’re Choosing Brinkify SA</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              At Brinkify SA, we believe every skilled individual and growing company deserves the opportunity to shine. 
              By joining Brinkify, you’re unlocking access to verified exposure, real clients, and tools designed to grow your craft or business. 
              Together, we’re building a more connected and trusted workforce across South Africa.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 max-w-6xl">
            <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-3 text-blue-700 dark:text-blue-400">For Workers</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create your profile, upload your portfolio, receive verified job leads, and chat directly with clients. 
                Get reviewed and climb Brinkify’s local rankings to become a certified professional.
              </p>
              <button
                onClick={() => navigateAndClose('/auth/signup')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Join as a Worker
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-3 text-blue-700 dark:text-blue-400">For Companies</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Post jobs, manage teams, get featured in local searches, and access professional tools to handle client quotes, analytics, and marketing. 
                Brinkify helps your business stand out where it matters most.
              </p>
              <button
                onClick={() => navigateAndClose('/auth/signup')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Register Company
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12">Built for Real Growth</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                { title: 'Verified Exposure', desc: 'Get listed, gain visibility, and appear higher in local search results.' },
                { title: 'Learning Resources', desc: 'Access safety guides, tips, and professional development materials.' },
                { title: 'Priority Listings', desc: 'Stand out with certified badges and featured placements.' },
                { title: 'Analytics Dashboard', desc: 'Track performance — profile views, ratings, and job conversions.' },
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2 text-blue-600 dark:text-blue-400">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-blue-600 text-white text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Start Building Your Future Today</h2>
            <p className="mb-6 text-blue-100">
              Whether you’re a freelancer, contractor, or company — Brinkify SA helps you unlock new opportunities and grow your brand.
            </p>
            <button
              onClick={() => navigateAndClose('/auth/signup')}
              className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full shadow-md hover:bg-blue-50 transition"
            >
              Join Brinkify Now
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-8 text-center">
        <div className="container mx-auto px-4">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Brinkify SA</span>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            © {new Date().getFullYear()} Brinkify SA (Pty) Ltd. Connecting South Africa’s skilled workforce with real opportunities.
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
