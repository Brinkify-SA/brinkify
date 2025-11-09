
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Home, Briefcase, MessageSquare, Star, Wallet, Settings, LogOut, User as UserIcon } from 'lucide-react';

// 🔒 Mock user — include location for completeness
const MOCK_USER = {
  name: 'Thabo N.',
  role: 'worker', // Change to 'worker' to test worker view
  avatar: 'https://ui-avatars.com/api/?name=Thabo+N&background=4F46E5&color=fff',
  location: 'Johannesburg, Sandton',
  verified: false, // Add verification status
};

export default function DashboardPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<typeof MOCK_USER | null>(null);

  useEffect(() => {
    setUser(MOCK_USER);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
 router.push(path as any);
  };

  const handleLogout = () => {
    setUser(null);
    router.push('/auth/login');
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* --- Navbar --- */}
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
              <button onClick={() => navigate('/profile/edit')} className="text-left text-lg font-medium flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Edit Profile
              </button>
              <button onClick={handleLogout} className="text-left text-lg font-medium flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* --- Main Dashboard --- */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md relative">
          <button
            onClick={handleEditProfile}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
            aria-label="Edit profile"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
              <p className="opacity-90 mt-1">
                {user.role === 'worker'
                  ? `Available in ${user.location} • Manage your jobs and grow your reputation.`
                  : `Based in ${user.location} • Find trusted professionals for your home.`}
              </p>
              {user.role === 'worker' && !user.verified && (
                <div className="mt-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 rounded-md">
                  <p className="font-bold">Account Not Verified</p>
                  <p className="text-sm">Complete your profile to get verified and start applying for jobs.</p>
                  <button
                    onClick={handleEditProfile}
                    className="mt-1 text-sm font-bold text-yellow-800 hover:underline"
                  >
                    Get Verified
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-white/30 cursor-pointer"
                onClick={handleEditProfile}
              />
            </div>
          </div>
          <div className="mt-4 text-center sm:text-left">
            <button
              onClick={handleEditProfile}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              <UserIcon className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Role-Specific Content */}
        {user.role === 'worker' ? <WorkerDashboard /> : <CustomerDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-6 text-center">
        <div className="container mx-auto px-4">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Brinkify SA</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            © {new Date().getFullYear()} Connecting skilled workers with homeowners across South Africa.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ======================
// Worker Dashboard View
// ======================
function WorkerDashboard() {
  const stats = [
    { label: 'Active Jobs', value: '5', change: '+2' },
    { label: 'Total Earnings', value: 'R 8,420', change: '+12%' },
    { label: 'Avg. Rating', value: '4.8', change: '⭐' },
  ];

  const recentJobs = [
    { id: 'J001', customer: 'Sarah K.', title: 'Fix kitchen light', status: 'In Progress', date: '2025-10-25' },
    { id: 'J002', customer: 'David M.', title: 'Install ceiling fan', status: 'Completed', date: '2025-10-20' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-green-600 text-sm mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* ✅ Quick Actions — now includes Messages for Workers */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/jobs" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <Briefcase className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>View Jobs</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Messages</span>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Jobs</h2>
          <Link href="/my-jobs" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View All</Link>
        </div>
        <div className="space-y-4">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{job.customer} • {job.date}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                job.status === 'Completed' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {job.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========================
// Customer Dashboard View
// ========================
function CustomerDashboard() {
  const stats = [
    { label: 'Active Jobs', value: '2', change: '1 pending' },
    { label: 'Total Spent', value: 'R 3,200', change: '' },
    { label: 'Saved Pros', value: '8', change: '+1' },
  ];

  const recentJobs = [
    { id: 'J101', worker: 'John D.', title: 'Bathroom tiling', status: 'Completed', date: '2025-10-22' },
    { id: 'J102', worker: 'Lerato P.', title: 'Garden cleanup', status: 'In Progress', date: '2025-10-26' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            {stat.change && <p className="text-gray-500 text-sm mt-1">{stat.change}</p>}
          </div>
        ))}
      </div>

      {/* ✅ Quick Actions — Messages now works */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/post-job" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <Home className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Post a Job</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Messages</span>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Jobs</h2>
          <Link href="/my-jobs" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View All</Link>
        </div>
        <div className="space-y-4">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">With {job.worker} • {job.date}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                job.status === 'Completed' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {job.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
