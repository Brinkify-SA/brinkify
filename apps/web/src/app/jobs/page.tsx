// app/jobs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Home, Briefcase, MapPin, Clock, MessageCircle, CheckCircle, User, ArrowLeft } from 'lucide-react';

// 🔒 Mock user — now includes location
const MOCK_USER = {
  id: 'user_123',
  name: 'Thabo N.',
  role: 'worker', // Change to 'customer' to test homeowner view
  location: 'Johannesburg, Sandton',
};

// 📋 Mock job data — all include location
const MOCK_JOBS = {
  workerJobs: [
    {
      id: 'job_001',
      title: 'Fix kitchen light',
      description: 'Light not turning on. Need electrician ASAP.',
      location: 'Pretoria, Centurion',
      budget: 'R 450',
      postedAt: '2025-10-25',
      customerId: 'cust_001',
      customerName: 'Sarah K.',
      status: 'open',
    },
    {
      id: 'job_002',
      title: 'Install ceiling fan',
      description: 'New fan needs wiring and mounting.',
      location: 'Johannesburg, Sandton',
      budget: 'R 850',
      postedAt: '2025-10-24',
      customerId: 'cust_002',
      customerName: 'David M.',
      status: 'open',
    },
    {
      id: 'job_003',
      title: 'Rewire garage',
      description: 'Full rewiring of detached garage.',
      location: 'Johannesburg, Rosebank',
      budget: 'R 1,200',
      postedAt: '2025-10-26',
      customerId: 'cust_003',
      customerName: 'Linda T.',
      status: 'open',
    },
    {
      id: 'job_004',
      title: 'Outdoor lighting',
      description: 'Install path and security lights.',
      location: 'Cape Town, Claremont',
      budget: 'R 950',
      postedAt: '2025-10-23',
      customerId: 'cust_004',
      customerName: 'Mike R.',
      status: 'open',
    },
  ],
  customerJobs: [
    {
      id: 'job_101',
      title: 'Bathroom tiling',
      description: 'Replace old tiles in main bathroom.',
      location: 'Cape Town, Claremont',
      budget: 'R 3,200',
      postedAt: '2025-10-22',
      workerId: 'work_001',
      workerName: 'John D.',
      status: 'completed',
    },
    {
      id: 'job_102',
      title: 'Garden cleanup',
      description: 'Remove weeds, trim hedges, mow lawn.',
      location: 'Durban, Umhlanga',
      budget: 'R 600',
      postedAt: '2025-10-26',
      workerId: 'work_002',
      workerName: 'Lerato P.',
      status: 'in-progress',
    },
  ],
};

const isJobInUserArea = (jobLocation: string, userLocation: string): boolean => {
  if (!jobLocation || !userLocation) return false;
  const jobCity = jobLocation.split(',')[0]?.trim().toLowerCase();
  const userCity = userLocation.split(',')[0]?.trim().toLowerCase();
  return jobCity === userCity;
};

export default function JobsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<typeof MOCK_USER | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    setUser(MOCK_USER);
    if (MOCK_USER.role === 'worker') {
      const localJobs = MOCK_JOBS.workerJobs.filter((job) =>
        isJobInUserArea(job.location, MOCK_USER.location)
      );
      setJobs(localJobs);
    } else {
      setJobs(MOCK_JOBS.customerJobs);
    }
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

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  const isWorker = user.role === 'worker';
  const userCity = user.location.split(',')[0]?.trim() || user.location;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* --- Navbar --- */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Back Button (replaces logo on this page for better UX) */}
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <h1 className="text-lg font-bold text-gray-800 dark:text-white md:hidden">
            {isWorker ? 'Jobs' : 'My Jobs'}
          </h1>

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
              <button onClick={handleLogout} className="text-left text-lg font-medium">Log Out</button>
            </nav>
          </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {isWorker ? 'Available Jobs' : 'Your Posted Jobs'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isWorker
              ? `Jobs in ${userCity} and nearby areas`
              : 'Track the status of jobs you’ve posted on Brinkify SA.'}
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              {isWorker ? `No jobs in ${userCity} right now` : 'You haven’t posted any jobs yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isWorker
                ? 'Jobs are added daily. Check back soon or update your location in your profile.'
                : 'Post your first job to connect with skilled workers in your area.'}
            </p>
            {isWorker ? (
              <button
                onClick={() => navigate('/profile/edit')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Update Location
              </button>
            ) : (
              <button
                onClick={() => navigate('/explore')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Post a Job
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isWorker={isWorker} />
            ))}
          </div>
        )}
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

// JobCard component remains unchanged
function JobCard({ job, isWorker }: { job: any; isWorker: boolean }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded">Open</span>;
      case 'applied':
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs px-2 py-1 rounded">Applied</span>;
      case 'assigned':
        return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded">Assigned</span>;
      case 'in-progress':
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-2 py-1 rounded">In Progress</span>;
      case 'completed':
        return <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">Completed</span>;
      default:
        return <span className="text-xs px-2 py-1 rounded">Unknown</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {isWorker ? <Home className="text-blue-600 dark:text-blue-400" /> : <User className="text-blue-600 dark:text-blue-400" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">{job.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">{job.description}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Posted {job.postedAt}
            </div>
            <div className="font-medium">{job.budget}</div>
          </div>

          <div className="mt-3">
            <p className="text-sm">
              {isWorker ? (
                <>
                  <span className="font-medium">Posted by:</span> {job.customerName}
                </>
              ) : (
                <>
                  <span className="font-medium">Worker:</span> {job.workerName}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {getStatusBadge(job.status)}

          <div className="flex gap-2">
            <button
              type="button"
              title="Open messages"
              className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {isWorker && job.status === 'open' && (
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium">
                Apply
              </button>
            )}
            {!isWorker && (job.status === 'assigned' || job.status === 'in-progress') && (
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
