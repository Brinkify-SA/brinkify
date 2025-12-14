'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';

export default function PrivacyPage() {
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={toggleMenu}></div>

            <div className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-800 shadow-2xl p-6 pt-16 transform transition-transform duration-300 ease-in-out">
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <nav className="flex flex-col space-y-5 mt-6">
                {[
                  { label: 'Home', path: '/' },
                  { label: 'Explore', path: '/explore' },
                  { label: 'About Us', path: '/about' },
                  { label: 'Terms & Conditions', path: '/terms' },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="text-left text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
              Privacy Policy
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
              Effective: 12 September 2025<br />
              Last updated: 23 November 2025
            </p>
          </div>

          <div className="prose prose-lg prose-blue dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">1. Introduction</h2>
              <p>
                <strong>Brinkify SA</strong> (“Brinkify”, “we”, “our” or “us”) is committed to protecting personal 
                information. This Privacy Policy explains what information we collect, how we use it, 
                how we protect it, and your rights under the <strong>Protection of Personal Information Act (POPIA)</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">2. Who We Are</h2>
              <ul className="list-none space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>Organisation:</strong> Brinkify SA</li>
                <li><strong>Email:</strong> <a href="mailto:info@brinkifysa.co.za" className="text-blue-600 dark:text-blue-400 hover:underline">info@brinkifysa.co.za</a></li>
                <li><strong>Phone:</strong> +27 78 042 0107</li>
                <li><strong>Website:</strong> <a href="https://www.brinkifysa.co.za" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.brinkifysa.co.za</a></li>
              </ul>
              <p className="mt-3">
                <strong>Data Protection Officer (DPO):</strong><br />
                Email: <a href="mailto:dpo@brinkifysa.co.za" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">dpo@brinkifysa.co.za</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">3. Scope</h2>
              <p>
                This policy applies to all personal information collected from website visitors, app 
                users, customers, workers, applicants, employees, and partners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">4. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Identifiers: name, ID number, phone, email</li>
                <li>Account details: username, password</li>
                <li>Payment and transaction data</li>
                <li>Location data (with app permission)</li>
                <li>Device data: IP address, browser info</li>
                <li>Communications with Brinkify</li>
                <li>Job-related information from clients and workers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">5. How We Collect Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Directly from you when you register or contact us</li>
                <li>Automatically through website or app usage</li>
                <li>Through service providers (payments, analytics)</li>
                <li>Via cookies and similar technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">6. Legal Basis</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your consent</li>
                <li>Performance of a contract</li>
                <li>Legal obligations</li>
                <li>Legitimate interests such as fraud prevention</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">7. How We Use Personal Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account creation and verification</li>
                <li>Connecting workers and clients</li>
                <li>Payments and transaction processing</li>
                <li>Customer support and communication</li>
                <li>Improving platform functionality and security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">8. Sharing of Data</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Service providers and contractors</li>
                <li>Payment processors</li>
                <li>Law enforcement when required</li>
                <li>Business partners helping operate the platform</li>
              </ul>
              <p className="mt-2">
                We do <strong>not</strong> sell your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">9. Cross-Border Transfers</h2>
              <p>
                If data is transferred outside South Africa, we ensure adequate protection according to 
                POPIA using secure contractual frameworks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">10. Data Security</h2>
              <p>
                We use administrative, technical, and physical safeguards to protect personal 
                information from unauthorized access, misuse, or loss.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">11. Data Retention</h2>
              <p>
                We retain information only as long as necessary for legal, contractual, or operational 
                reasons. When no longer needed, it is securely deleted or anonymized.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">12. Your Rights</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access your personal information</li>
                <li>Request corrections</li>
                <li>Request deletion</li>
                <li>Withdraw consent</li>
                <li>Object to processing</li>
                <li>Lodge a complaint with the Information Regulator</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">13. Cookies</h2>
              <p>
                We use cookies for website functionality, analytics, and improvements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">14. Children’s Privacy</h2>
              <p>
                We do not knowingly collect information from individuals under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">15. Changes to This Policy</h2>
              <p>
                Updates will be posted with a revised “Last updated” date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-blue-500 pl-3">16. Contact Us</h2>
              <p>
                For privacy concerns, email our DPO at{' '}
                <a href="mailto:dpo@brinkifysa.co.za"
                   className="font-medium text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  dpo@brinkifysa.co.za
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