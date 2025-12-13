'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';

export default function TermsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 dark:from-gray-900 dark:to-gray-950 dark:text-gray-200 transition-colors duration-300">
      
      {/* Navbar */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-[60]">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={toggleMenu}
            ></div>

            <div className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-800 shadow-2xl p-6 pt-16 transform transition-transform duration-300 ease-in-out">
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <nav className="flex flex-col space-y-5 mt-6">
                {[
                  { label: 'Home', path: '/' },
                  { label: 'Explore', path: '/explore' },
                  { label: 'About Us', path: '/about' },
                  { label: 'Privacy Policy', path: '/privacy' },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="text-left text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-10 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500">
              Terms and Conditions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
              Last updated: {new Date().toLocaleDateString('en-ZA')}
            </p>
          </div>

          <div className="prose prose-lg prose-blue dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">1. Introduction</h2>
              <p>
                Welcome to <strong>Brinkify SA (Pty) Ltd</strong> ("Brinkify SA", "we", "us", or "our"). 
                These Terms and Conditions govern your use of our platform, which connects 
                skilled South African workers with homeowners and businesses seeking their services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">2. Acceptance of Terms</h2>
              <p>
                By accessing or using Brinkify SA, you agree to be bound by these Terms. 
                If you do not agree, please discontinue using our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">3. User Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Provide accurate and truthful information during registration and profile creation.</li>
                <li>Maintain the confidentiality of your account credentials.</li>
                <li>Comply with all applicable South African laws and regulations.</li>
                <li>Avoid using the platform for unlawful, fraudulent, or abusive activities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">4. Worker Verification</h2>
              <p>
                Brinkify SA reserves the right to verify the identity, qualifications, 
                and background of workers. Submission of documents does not guarantee approval.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">5. Payments and Subscriptions</h2>
              <p>
                Workers may subscribe to paid plans (Basic, Pro, Elite) to access additional features.
                Payments are processed via secure third-party providers (e.g., Stripe). 
                All fees are non-refundable except where required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">6. Intellectual Property</h2>
              <p>
                All content on Brinkify SA (including logos, text, and the user interface) 
                is owned by Brinkify SA (Pty) Ltd. You may not reproduce, modify, or distribute 
                any part of the platform without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">7. Limitation of Liability</h2>
              <p>
                Brinkify SA acts as a marketplace and is not responsible for the quality, safety, 
                or legality of services provided by workers. We do not guarantee job outcomes or earnings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">8. Termination</h2>
              <p>
                We may suspend or terminate your account at any time for violations of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">9. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the Republic of South Africa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">10. Contact Us</h2>
              <p>
                For any questions regarding these Terms, you may contact us at{' '}
                <a
                  href="mailto:support@brinkifysa.co.za"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  support@brinkifysa.co.za
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-8 text-center">
        <div className="container mx-auto px-4">
          <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Brinkify SA
          </span>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            © {new Date().getFullYear()} Brinkify SA (Pty) Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}