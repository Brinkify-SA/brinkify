// app/terms/page.tsx
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
              className="absolute inset-0 bg-black/50"
              onClick={toggleMenu}
            ></div>

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <nav className="flex flex-col space-y-4 mt-6">
                <button onClick={() => navigate('/')} className="text-left text-lg font-medium">
                  Home
                </button>
                <button onClick={() => navigate('/explore')} className="text-left text-lg font-medium">
                  Explore
                </button>
                <button onClick={() => navigate('/about')} className="text-left text-lg font-medium">
                  About Us
                </button>
                <button onClick={() => navigate('/privacy')} className="text-left text-lg font-medium">
                  Privacy Policy
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Terms and Conditions
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to Brinkify SA (Pty) Ltd ("Brinkify SA", "we", "us", or "our"). 
            These Terms and Conditions govern your use of our platform, which connects 
            skilled South African workers with homeowners and businesses seeking their services.
          </p>

          <h2>2. Acceptance of Terms</h2>
          <p>
            By accessing or using Brinkify SA, you agree to be bound by these Terms. 
            If you do not agree, please discontinue using our platform.
          </p>

          <h2>3. User Responsibilities</h2>
          <ul>
            <li>Provide accurate and truthful information during registration and profile creation.</li>
            <li>Maintain the confidentiality of your account credentials.</li>
            <li>Comply with all applicable South African laws and regulations.</li>
            <li>Avoid using the platform for unlawful, fraudulent, or abusive activities.</li>
          </ul>

          <h2>4. Worker Verification</h2>
          <p>
            Brinkify SA reserves the right to verify the identity, qualifications, 
            and background of workers. Submission of documents does not guarantee approval.
          </p>

          <h2>5. Payments and Subscriptions</h2>
          <p>
            Workers may subscribe to paid plans (Basic, Pro, Elite) to access additional features.
            Payments are processed via secure third-party providers (e.g., Stripe). 
            All fees are non-refundable except where required by law.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on Brinkify SA (including logos, text, and the user interface) 
            is owned by Brinkify SA (Pty) Ltd. You may not reproduce, modify, or distribute 
            any part of the platform without written permission.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            Brinkify SA acts as a marketplace and is not responsible for the quality, safety, 
            or legality of services provided by workers. We do not guarantee job outcomes or earnings.
          </p>

          <h2>8. Termination</h2>
          <p>
            We may suspend or terminate your account at any time for violations of these Terms.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Republic of South Africa.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            For any questions regarding these Terms, you may contact us at{' '}
            <a
              href="mailto:support@brinkifysa.co.za"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@brinkifysa.co.za
            </a>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-6 text-center">
        <div className="container mx-auto px-4">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Brinkify SA</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            © {new Date().getFullYear()} Brinkify SA (Pty) Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
