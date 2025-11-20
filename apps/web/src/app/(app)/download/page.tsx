// app/download/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';

export default function DownloadPage() {
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

  // Replace with your actual app store links when ready
  const androidLink = 'https://play.google.com/store/apps/details?id=com.brinkify.sa'; // Placeholder
  const iosLink = 'https://apps.apple.com/za/app/brinkify-sa/id123456789'; // Placeholder

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
            <button onClick={() => navigate('/download')} className="font-semibold text-blue-600 dark:text-blue-400">
              Download
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
              <button onClick={() => navigate('/download')} className="text-left text-lg font-medium">Download</button>
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
            Download Brinkify SA
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
            Get the app for on-the-go access to skilled professionals — anytime, anywhere.
          </p>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <a
              href={androidLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6915026,0.669739776 C18.5072821,0.669739776 19.1624881,1.32624723 19.1624881,2.13815502 L19.1624881,21.8618045 C19.1624881,22.6751495 18.5072821,23.3326099 17.6915026,23.3326099 L4.31401648,23.3326099 C3.50547088,23.3326099 2.84651125,22.6751495 2.84651125,21.8618045 L2.84651125,2.13815502 C2.84651125,1.32624723 3.50547088,0.669739776 4.31401648,0.669739776 L17.6915026,0.669739776 Z M16.5351563,2.94224407 L7.45847665,2.94224407 L7.45847665,20.5974501 L16.5351563,20.5974501 L16.5351563,2.94224407 Z"/>
              </svg>
              Google Play
            </a>
            <a
              href={iosLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5c-.83,1.24-1.71,2.45-3.05,2.47-1.34.03-1.77-.79-3.29-.79-1.53,0-2,.77-3.27.82-1.31.05-2.3-1.3-3.16-2.54-1.73-2.87-2.26-6.38-.6-8.02,1.63-1.52,4.56-.36,6.08,1.1,1.09,1.1,1.59.99,2.78.59,1.08-.4,1.87-.89,2.5-1.66-.99-.73-1.73-1.72-2.1-2.95-.16-.53.1-1.08.66-1.16.56-.08,1.05.46,1.21,1,.01.06.05.2.08.26h3.62c.06-.3.17-.76.17-1.39,0-2.24-1.46-4.52-4.09-5.73-1.2-.55-2.48-.73-3.76-.73-3.31,0-5.76,2.33-5.76,5.52,0,2.81,1.98,4.81,5.01,5.02.56.03,1.11.04,1.67.03,1.1-.01,2.2-.03,3.29-.12-.46,1.11-1.18,2.04-2.08,2.68"/>
              </svg>
              App Store
            </a>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            Available on Android and iOS. For desktop users, log in via the web version.
          </p>
        </div>
      </section>

      {/* WHY BRINKIFY SA SECTION */}
      <section className="bg-white dark:bg-gray-800 py-12 px-6 text-center border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Why Use the Brinkify SA App?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            Manage bookings, chat with professionals, leave reviews, and get job alerts — all from your pocket.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Push Notifications', desc: 'Get instant alerts for new job matches or messages.' },
              { title: 'Easy Booking', desc: 'Find and book verified professionals in seconds.' },
              { title: 'Secure & Private', desc: 'Your data and payments are protected end-to-end.' },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-gray-50 dark:bg-gray-700/40 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESKTOP MESSAGE */}
      <section className="py-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            Using a Computer?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Brinkify SA is optimized for mobile, but you can still access all features on the web.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium shadow transition"
          >
            Log In on Web
          </button>
        </div>
      </section>

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