// app/my-jobs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Home, Briefcase, MapPin, Clock, Star, User, Calendar, ArrowLeft, CheckCircle } from 'lucide-react';
import Loader from '@/components/loader'; // Assuming a Loader component exists

interface UserProfile {
  id: string;
  full_name: string;
  role: 'worker' | 'customer' | 'company';
}

interface Job {
  id: string;
  title: string;
  description?: string;
  location: string;
  min_budget?: number;
  max_budget?: number;
  created_at: string;
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  customer_id: string;
  worker_id?: string;
  profiles_customer?: { full_name: string }[]; // Changed to array
  profiles_worker?: { full_name: string }[]; // Changed to array
  reviews?: { rating: number }[];
}

export default function MyJobsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentJobs, setCurrentJobs] = useState<Job[]>([]);
  const [jobHistory, setJobHistory] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDataAndJobs = () => {
      setLoading(true);
      setError(null);

      try {
        // Mock users (use localStorage.userEmail to pick)
        const mockUsers: { [key: string]: UserProfile } = {
          'homeowner@test.com': { id: '1', full_name: 'John Homeowner', role: 'customer' },
          'worker@test.com': { id: '2', full_name: 'Sarah Worker', role: 'worker' },
        };

        const storedEmail = localStorage.getItem('userEmail') || 'homeowner@test.com';
        const profile = mockUsers[storedEmail] || mockUsers['homeowner@test.com'];
        setUser(profile as UserProfile);

        // Seed some jobs locally (will be merged with persisted `myJobs` key)
        const seedCurrent: Job[] = [
          { id: 'job-2', title: 'Bathroom Tiling', location: 'Johannesburg, SA', min_budget: 4500, max_budget: 9000, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'in-progress', customer_id: '9', worker_id: '2', profiles_customer: [{ full_name: 'Robert Taylor' }] },
          { id: 'job-3', title: 'Electrical Wiring Installation', location: 'Cape Town, SA', min_budget: 6000, max_budget: 10000, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'assigned', customer_id: '4', worker_id: undefined, profiles_customer: [{ full_name: 'Jane Smith' }] },
        ];

        const seedHistory: Job[] = [
          { id: 'job-1', title: 'Kitchen Renovation', location: 'Cape Town, SA', min_budget: 15000, max_budget: 22000, created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed', customer_id: '1', worker_id: '2', profiles_customer: [{ full_name: 'John Homeowner' }], reviews: [{ rating: 4.8 }] },
        ];

        // Load persisted jobs (if any)
        const raw = localStorage.getItem('myJobs');
        let persisted: Job[] = [];
        if (raw) {
          try { persisted = JSON.parse(raw); } catch { persisted = []; }
        }

        // Merge persisted into seeds
        const mergedCurrent = [...seedCurrent];
        const mergedHistory = [...seedHistory];
        persisted.forEach(p => {
          const curIdx = mergedCurrent.findIndex(m => m.id === p.id);
          const histIdx = mergedHistory.findIndex(m => m.id === p.id);
          if (curIdx >= 0) mergedCurrent[curIdx] = p;
          else if (histIdx >= 0) mergedHistory[histIdx] = p;
          else {
            // place based on status
            if (p.status === 'completed') mergedHistory.unshift(p);
            else mergedCurrent.unshift(p);
          }
        });

        if (profile.role === 'worker') {
          const currentJobsData = mergedCurrent.filter(j => j.worker_id === profile.id || (j.profiles_worker || []).some(w => w.full_name === profile.full_name));
          const historyJobsData = mergedHistory.filter(j => j.worker_id === profile.id || (j.profiles_worker || []).some(w => w.full_name === profile.full_name));
          setCurrentJobs(currentJobsData);
          setJobHistory(historyJobsData);
        } else {
          const currentJobsData = mergedCurrent.filter(j => j.customer_id === profile.id);
          const historyJobsData = mergedHistory.filter(j => j.customer_id === profile.id);
          setCurrentJobs(currentJobsData);
          setJobHistory(historyJobsData);
        }

      } catch (err: any) {
        console.error('Error loading jobs:', err);
        setError(err.message || 'Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndJobs();
  }, [router]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/auth/login');
  };

  const markFinishedAndPost = (jobId: string) => {
    if (!user) return;

    // update state
    const updatedCurrent = currentJobs.map(j => j.id === jobId ? { ...j, status: 'completed' } : j);
    setCurrentJobs(updatedCurrent.filter(j => j.status !== 'completed') as Job[]);

    const finishedJob = currentJobs.find(j => j.id === jobId);
    if (!finishedJob) return;

    // persist in myJobs
    const raw = localStorage.getItem('myJobs');
    let persisted: Job[] = [];
    if (raw) {
      try { persisted = JSON.parse(raw); } catch { persisted = []; }
    }
    const updatedJob = { ...finishedJob, status: 'completed', worker_id: user.id } as Job;
    const idx = persisted.findIndex(p => p.id === jobId);
    if (idx >= 0) persisted[idx] = updatedJob; else persisted.unshift(updatedJob);
    localStorage.setItem('myJobs', JSON.stringify(persisted));

    // add to jobHistory state
    setJobHistory(prev => [updatedJob, ...prev]);

    // create a feed post
    const rawFeed = localStorage.getItem('feedPosts');
    let feed: any[] = [];
    if (rawFeed) {
      try { feed = JSON.parse(rawFeed); } catch { feed = []; }
    }

    const newPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      workerId: user.id,
      worker: { id: user.id, name: user.full_name, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=4F46E5&color=fff`, rating: 4.8, reviews: 0 },
      title: `Finished: ${finishedJob.title}`,
      category: finishedJob.title,
      location: finishedJob.location,
      description: `Completed job for ${finishedJob.profiles_customer?.[0]?.full_name || 'client'}. ${finishedJob.description}`,
      images: [],
      likes: 0,
      comments: 0,
      views: 0,
      saves: 0,
      createdAt: new Date().toISOString(),
      completionTime: '—',
      price: finishedJob.max_budget ? `ZAR ${finishedJob.max_budget}` : undefined,
      verified: true,
      // metadata for client-side management
      createdByEmail: localStorage.getItem('userEmail') || null,
      isLocal: true,
    };

    feed.unshift(newPost);
    localStorage.setItem('feedPosts', JSON.stringify(feed));

    // quick feedback
    setError(null);
    alert('Marked finished and posted to Feed');
    router.push('/feed');
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button onClick={() => router.push('/dashboard')} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">No user data found. Please log in.</p>
        <button onClick={() => router.push('/auth/login')} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go to Login
        </button>
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
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <h1 className="text-lg font-bold text-gray-800 dark:text-white md:hidden">
            {isWorker ? 'My Jobs' : 'My Jobs'}
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

      {/* ✅ Mobile Menu — MOVED OUTSIDE HEADER */}
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
                <JobCard
                  key={job.id}
                  job={job}
                  type="current"
                  isWorker={isWorker}
                  onViewDetails={() => router.push(`/jobs/${job.id}`)}
                  onMarkFinished={() => markFinishedAndPost(job.id)}
                />
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
                <JobCard
                  key={job.id}
                  job={job}
                  type="history"
                  isWorker={isWorker}
                  onViewDetails={() => router.push(`/jobs/${job.id}`)}
                />
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

function JobCard({
  job,
  type,
  isWorker,
  onViewDetails,
  onMarkFinished,
}: {
  job: Job;
  type: 'current' | 'history';
  isWorker: boolean;
  onViewDetails: () => void;
  onMarkFinished?: () => void;
}) {
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const otherPartyName = isWorker
    ? job.profiles_customer?.[0]?.full_name
    : job.profiles_worker?.[0]?.full_name;

  const displayBudget = (job: Job) => {
    if (job.min_budget && job.max_budget) {
      return `ZAR ${job.min_budget} - ${job.max_budget}`;
    }
    if (job.min_budget) {
      return `ZAR ${job.min_budget}`;
    }
    if (job.max_budget) {
      return `Up to ZAR ${job.max_budget}`;
    }
    return 'N/A';
  };

  const averageRating = job.reviews && job.reviews.length > 0
    ? (job.reviews.reduce((sum, review) => sum + review.rating, 0) / job.reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 transition hover:shadow-md">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{job.title}</h3>
        {type === 'current' && (
          <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusChip(job.status)}`}>
            {job.status === 'in-progress' ? 'In Progress' : 'Assigned'}
          </span>
        )}
        {type === 'history' && job.status === 'completed' && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{averageRating}</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {otherPartyName && (
          <div className="flex items-center gap-2">
            {isWorker ? <User className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
            <span>{otherPartyName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="font-bold text-gray-800 dark:text-white">{displayBudget(job)}</span>
        <div className="flex items-center gap-3">
          {type === 'current' && isWorker && onMarkFinished && (
            <button
              onClick={onMarkFinished}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Finished & Post
            </button>
          )}
          <button
            onClick={onViewDetails}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
