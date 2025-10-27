// app/my-jobs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Home, Briefcase, MapPin, Clock, Star, User, Calendar } from 'lucide-react';

// 🔒 Mock user
const MOCK_USER = {
  id: 'user_123',
  name: 'Thabo N.',
  role: 'worker', // Change to 'customer' to test homeowner view
};

// 📋 Mock job data — split by status
const MOCK_JOBS = {
  // Worker's jobs
  worker: {
    current: [
      {
        id: 'job_w1',
        title: 'Install ceiling fan',
        customerName: 'David M.',
        location: 'Johannesburg, Sandton',
        budget: 'R 850',
        startDate: '2025-10-24',
        status: 'in-progress',
      },
      {
        id: 'job_w2',
        title: 'Fix kitchen light',
        customerName: 'Sarah K.',
        location: 'Pretoria, Centurion',
        budget: 'R 450',
        startDate: '2025-10-26',
        status: 'assigned',
      },
    ],
    history: [
      {
        id: 'job_w3',
        title: 'Rewire living room',
        customerName: 'Linda T.',
        location: 'Cape Town, Observatory',
        budget: 'R 1,200',
        completedDate: '2025-10-20',
        rating: 5,
      },
      {
        id: 'job_w4',
        title: 'Install outdoor lights',
        customerName: 'Mike R.',
        location: 'Durban, Umhlanga',
        budget: 'R 950',
        completedDate: '2025-10-15',
        rating: 4,
      },
    ],
  },
  // Customer's jobs
  customer: {
    current: [
      {
        id: 'job_c1',
        title: 'Garden cleanup',
        workerName: 'Lerato P.',
        location: 'Durban, Umhlanga',
        budget: 'R 600',
        startDate: '2025-10-26',
        status: 'in-progress',
      },
      {
        id: 'job_c2',
        title: 'Paint bedroom',
        workerName: 'James B.',
        location: 'Pretoria, Hatfield',
        budget: 'R 1,800',
        startDate: '2025-10-25',
        status: 'assigned',
      },
    ],
    history: [
      {
        id: 'job_c3',
        title: 'Bathroom tiling',
        workerName: 'John D.',
        location: 'Cape Town, Claremont',
        budget: 'R 3,200',
        completedDate: '2025-10-22',
        rating: 5,
      },
      {
        id: 'job_c4',
        title: 'Fix leaking tap',
        workerName: 'Sipho M.',
        location: 'Johannesburg, Rosebank',
        budget: 'R 350',
        completedDate: '2025-10-10',
        rating: 4,
      },
    ],
  },
};

export default function MyJobsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<typeof MOCK_USER | null>(null);
  const [currentJobs, setCurrentJobs] = useState<any[]>([]);
  const [jobHistory, setJobHistory] = useState<any[]>([]);

  useEffect(() => {
    setUser(MOCK_USER);
    const data = MOCK_USER.role === 'worker' ? MOCK_JOBS.worker : MOCK_JOBS.customer;
    setCurrentJobs(data.current);
    setJobHistory(data.history);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    setUser(null);
    router.push('/auth/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  const isWorker = user.role === 'worker';
  const hasCurrent = currentJobs.length > 0;
  const hasHistory = jobHistory.length > 0;

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
              <button onClick={handleLogout} className="text-left text-lg font-medium">Log Out</button>
            </nav>
          </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {isWorker ? 'My Jobs' : 'My Posted Jobs'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isWorker
              ? 'Track your active jobs and review your work history.'
              : 'View your active job requests and past completed projects.'}
          </p>
        </div>

        {/* Current Jobs */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {isWorker ? 'Active Jobs' : 'Ongoing Jobs'}
            </h2>
          </div>

          {hasCurrent ? (
            <div className="space-y-4">
              {currentJobs.map((job) => (
                <JobCard key={job.id} job={job} type="current" isWorker={isWorker} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
              <Briefcase className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {isWorker ? 'You have no active jobs right now.' : 'You have no ongoing jobs.'}
              </p>
            </div>
          )}
        </section>

        {/* Job History */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Job History</h2>
          </div>

          {hasHistory ? (
            <div className="space-y-4">
              {jobHistory.map((job) => (
                <JobCard key={job.id} job={job} type="history" isWorker={isWorker} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
              <Calendar className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No completed jobs yet.
              </p>
            </div>
          )}
        </section>
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

// ===================
// Reusable Job Card
// ===================
function JobCard({ job, type, isWorker }: { job: any; type: 'current' | 'history'; isWorker: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">{job.title}</h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {isWorker ? (
              <>
                <User className="w-4 h-4" />
                <span>{job.customerName}</span>
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                <span>{job.workerName}</span>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </div>
            <div className="font-medium">{job.budget}</div>
          </div>

          {type === 'history' && job.completedDate && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              Completed on {job.completedDate}
            </div>
          )}

          {type === 'current' && job.startDate && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              Started {job.startDate}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          {type === 'history' && job.rating !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{job.rating}.0</span>
            </div>
          )}

          {type === 'current' && (
            <span className={`text-xs px-2 py-1 rounded ${
              job.status === 'in-progress'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
              {job.status === 'in-progress' ? 'In Progress' : 'Assigned'}
            </span>
          )}

          <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}