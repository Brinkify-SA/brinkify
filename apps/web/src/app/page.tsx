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
    router.push(path);
  };

  const openPrivacy = () => window.open('https://brinkifysa.co.za/privacy', '_blank');
  const openTerms = () => window.open('https://brinkifysa.co.za/terms', '_blank');
  const openContact = () => (window.location.href = 'mailto:support@brinkifysa.co.za');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors">
      {/* --- Navbar --- */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Brinkify SA
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigateAndClose('/explore')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Explore
            </button>
            <button
              onClick={() => navigateAndClose('/auth/login')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Login
            </button>
            <ModeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-blue-600 dark:text-blue-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ✅ Mobile Menu — now OUTSIDE header */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={toggleMenu}></div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="flex flex-col space-y-4 mt-6">
              <button
                onClick={() => navigateAndClose('/')}
                className="text-left text-lg font-medium"
              >
                Home
              </button>
              <button
                onClick={() => navigateAndClose('/explore')}
                className="text-left text-lg font-medium"
              >
                Explore
              </button>
              <button
                onClick={() => navigateAndClose('/about')}
                className="text-left text-lg font-medium"
              >
                About Us
              </button>
              <button
                onClick={() => navigateAndClose('/auth/login')}
                className="text-left text-lg font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigateAndClose('/auth/signup')}
                className="text-left text-lg font-medium"
              >
                Sign Up
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-950 py-16 md:py-24 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-block bg-blue-600 text-white font-bold text-3xl px-8 py-3 rounded-full mb-6">
              Brinkify SA
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              South Africa’s Trusted Platform Connecting Skilled Workers & Homeowners
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
              Get quality work. Build your reputation. Grow your income.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigateAndClose('/auth/signup')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                ✅ Sign Up Free
              </button>
              <button
                onClick={() => navigateAndClose('/auth/login')}
                className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 transition"
              >
                🔑 Already have an account? Log In
              </button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 max-w-6xl">
            {/* Workers */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-sm">
              <h3 className="text-xl font-bold mb-3">Find Jobs. Build Trust. Grow.</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Get verified, browse local job requests, chat with customers, and earn reviews to grow your reputation.
              </p>
              <button
                onClick={() => navigateAndClose('/auth/signup')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Register as Worker
              </button>
            </div>

            {/* Customers */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-sm">
              <h3 className="text-xl font-bold mb-3">Post Jobs. Hire Pros. Done Right.</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Describe your project, set your budget, get matched with verified local workers, and track progress in-app.
              </p>
              <button
                onClick={() => navigateAndClose('/auth/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Post a Job
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">Why Choose Brinkify SA?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: 'Verified Professionals',
                  desc: 'Every worker is ID-verified and background-checked for your safety.',
                },
                {
                  title: 'Local Matching',
                  desc: 'We connect you with skilled workers in your neighborhood.',
                },
                {
                  title: 'Secure In-App Chat',
                  desc: 'Communicate directly, share photos, and confirm details safely.',
                },
                {
                  title: 'Fair Commission Model',
                  desc: 'Transparent pricing. You only pay when you’re satisfied.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900 text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-12">Trusted by Thousands</h2>
            {[
              {
                text: '“Brinkify connected me with a top-rated electrician in 2 hours. Job done perfectly!”',
                author: '— Sarah K., Cape Town',
              },
              {
                text: '“Since joining Brinkify, my monthly income doubled. Great platform for serious workers.”',
                author: '— Thabo N., Johannesburg',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl mb-8 shadow-sm">
                <p className="italic mb-3">"{item.text}"</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">{item.author}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-8 text-center">
        <div className="container mx-auto px-4">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Brinkify SA</span>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            © {new Date().getFullYear()} Brinkify SA. Connecting skilled workers with homeowners across South Africa.
          </p>
          <div className="space-x-4 mt-3">
            <button onClick={openTerms} className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms
            </button>
            <span>•</span>
            <button onClick={openPrivacy} className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy
            </button>
            <span>•</span>
            <button onClick={openContact} className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}