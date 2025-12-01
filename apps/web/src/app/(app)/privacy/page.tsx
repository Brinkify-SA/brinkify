// app/privacy/page.tsx
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
            className="md:hidden text-blue-600 dark:text-blue-400"
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
            <div className="absolute inset-0 bg-black/50" onClick={toggleMenu}></div>

            <div className="absolute left-0 top-0 h-full w-3/4 bg-blue-600 text-white p-6 pt-16">
              <button onClick={toggleMenu} className="absolute top-4 right-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <nav className="flex flex-col space-y-4 mt-6">
                <button onClick={() => navigate('/')} className="text-left text-lg font-medium">Home</button>
                <button onClick={() => navigate('/explore')} className="text-left text-lg font-medium">Explore</button>
                <button onClick={() => navigate('/about')} className="text-left text-lg font-medium">About Us</button>
                <button onClick={() => navigate('/terms')} className="text-left text-lg font-medium">Terms & Conditions</button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert">

          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Effective: 12 September 2025<br />
            Last updated: 23 November 2025
          </p>

          <h2>1. Introduction</h2>
          <p>
            Brinkify SA (“Brinkify”, “we”, “our” or “us”) is committed to protecting personal 
            information. This Privacy Policy explains what information we collect, how we use it, 
            how we protect it, and your rights under POPIA.
          </p>

          <h2>2. Who We Are</h2>
          <ul>
            <li><strong>Organisation:</strong> Brinkify SA</li>
            <li><strong>Email:</strong> info@brinkifysa.co.za</li>
            <li><strong>Phone:</strong> +27 78 042 0107</li>
            <li><strong>Website:</strong> www.brinkifysa.co.za</li>
          </ul>
          <p>
            <strong>Data Protection Officer (DPO):</strong><br />
            Email: <a href="mailto:dpo@brinkifysa.co.za" className="text-blue-600 dark:text-blue-400">dpo@brinkifysa.co.za</a>
          </p>

          <h2>3. Scope</h2>
          <p>
            This policy applies to all personal information collected from website visitors, app 
            users, customers, workers, applicants, employees, and partners.
          </p>

          <h2>4. Information We Collect</h2>
          <ul>
            <li>Identifiers: name, ID number, phone, email</li>
            <li>Account details: username, password</li>
            <li>Payment and transaction data</li>
            <li>Location data (with app permission)</li>
            <li>Device data: IP address, browser info</li>
            <li>Communications with Brinkify</li>
            <li>Job-related information from clients and workers</li>
          </ul>

          <h2>5. How We Collect Information</h2>
          <ul>
            <li>Directly from you when you register or contact us</li>
            <li>Automatically through website or app usage</li>
            <li>Through service providers (payments, analytics)</li>
            <li>Via cookies and similar technologies</li>
          </ul>

          <h2>6. Legal Basis</h2>
          <ul>
            <li>Your consent</li>
            <li>Performance of a contract</li>
            <li>Legal obligations</li>
            <li>Legitimate interests such as fraud prevention</li>
          </ul>

          <h2>7. How We Use Personal Information</h2>
          <ul>
            <li>Account creation and verification</li>
            <li>Connecting workers and clients</li>
            <li>Payments and transaction processing</li>
            <li>Customer support and communication</li>
            <li>Improving platform functionality and security</li>
          </ul>

          <h2>8. Sharing of Data</h2>
          <ul>
            <li>Service providers and contractors</li>
            <li>Payment processors</li>
            <li>Law enforcement when required</li>
            <li>Business partners helping operate the platform</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal information.</p>

          <h2>9. Cross-Border Transfers</h2>
          <p>
            If data is transferred outside South Africa, we ensure adequate protection according to 
            POPIA using secure contractual frameworks.
          </p>

          <h2>10. Data Security</h2>
          <p>
            We use administrative, technical, and physical safeguards to protect personal 
            information from unauthorized access, misuse, or loss.
          </p>

          <h2>11. Data Retention</h2>
          <p>
            We retain information only as long as necessary for legal, contractual, or operational 
            reasons. When no longer needed, it is securely deleted or anonymized.
          </p>

          <h2>12. Your Rights</h2>
          <ul>
            <li>Access your personal information</li>
            <li>Request corrections</li>
            <li>Request deletion</li>
            <li>Withdraw consent</li>
            <li>Object to processing</li>
            <li>Lodge a complaint with the Information Regulator</li>
          </ul>

          <h2>13. Cookies</h2>
          <p>
            We use cookies for website functionality, analytics, and improvements.
          </p>

          <h2>14. Children’s Privacy</h2>
          <p>
            We do not knowingly collect information from individuals under 18.
          </p>

          <h2>15. Changes to This Policy</h2>
          <p>
            Updates will be posted with a revised “Last updated” date.
          </p>

          <h2>16. Contact Us</h2>
          <p>
            For privacy concerns, email our DPO at{' '}
            <a href="mailto:dpo@brinkifysa.co.za"
               className="text-blue-600 dark:text-blue-400">
              dpo@brinkifysa.co.za
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
