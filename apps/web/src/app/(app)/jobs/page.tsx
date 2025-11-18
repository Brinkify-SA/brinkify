'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Home,
  Briefcase,
  MapPin,
  Clock,
  MessageCircle,
  ArrowLeft,
  UserCheck,
  UserX,
} from 'lucide-react';
import Loader from '@/components/loader'; // Assuming a Loader component exists

interface UserProfile {
  id: string;
  full_name: string;
  role: 'worker' | 'customer' | 'company';
  location: string;
  plan_name: string;
  job_leads_used: number;
  leads_limit: number;
}

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  min_budget?: number;
  max_budget?: number;
  preferred_date?: string;
  images?: string[];
  created_at: string;
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  customer_id: string;
  worker_id?: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
  applications: {
    id: string;
    worker_id: string;
    status: 'pending' | 'approved' | 'denied';
    profiles: {
      full_name: string;
      avatar_url: string;
    };
  }[];
  conversations: {
    id: string;
  }[];
}

export default function JobsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchUserDataAndJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mock user data
        const mockUsers: { [key: string]: UserProfile } = {
          'worker@test.com': {
            id: '2',
            full_name: 'Sarah Worker',
            role: 'worker',
            location: 'Cape Town, SA',
            plan_name: 'Professional',
            job_leads_used: 15,
            leads_limit: 50,
          },
          'homeowner@test.com': {
            id: '1',
            full_name: 'John Homeowner',
            role: 'customer',
            location: 'Johannesburg, SA',
            plan_name: 'Premium',
            job_leads_used: 0,
            leads_limit: 0,
          },
        };

        // Get logged-in user email from localStorage
        const storedEmail = localStorage.getItem('userEmail') || 'homeowner@test.com';
        const profile = mockUsers[storedEmail] || mockUsers['homeowner@test.com'];

        setUser(profile as UserProfile);

        // Mock jobs data
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Kitchen Renovation',
            description: 'Need help renovating kitchen - new cabinets, countertops, and flooring',
            category: 'Home Renovation',
            location: 'Cape Town, SA',
            min_budget: 5000,
            max_budget: 8000,
            preferred_date: '2025-12-20',
            images: [],
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
            customer_id: '1',
            profiles: {
              full_name: 'John Homeowner',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            },
            applications: [
              {
                id: 'app1',
                worker_id: '2',
                status: 'pending',
                profiles: {
                  full_name: 'Sarah Worker',
                  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                },
              },
            ],
            conversations: [],
          },
          {
            id: '2',
            title: 'Electrical Wiring Installation',
            description: 'Install new electrical wiring in bedroom and bathroom',
            category: 'Electrical',
            location: 'Cape Town, SA',
            min_budget: 2000,
            max_budget: 3500,
            preferred_date: '2025-12-15',
            images: [],
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
            customer_id: '4',
            profiles: {
              full_name: 'Jane Smith',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
            },
            applications: [],
            conversations: [],
          },
          {
            id: '3',
            title: 'Plumbing Repair',
            description: 'Fix leaking pipes and install new fixtures',
            category: 'Plumbing',
            location: 'Cape Town, SA',
            min_budget: 1500,
            max_budget: 2500,
            preferred_date: '2025-12-10',
            images: [],
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
            customer_id: '5',
            profiles: {
              full_name: 'Mike Johnson',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            },
            applications: [],
            conversations: [],
          },
        ];

        // Filter jobs based on role
        let fetchedJobs: Job[] = [];
        if (profile.role === 'worker') {
          // Worker sees open jobs
          fetchedJobs = mockJobs.filter(job => job.status === 'open');
        } else if (profile.role === 'customer') {
          // Customer sees their own jobs
          fetchedJobs = mockJobs.filter(job => job.customer_id === profile.id);
        }

        setJobs(fetchedJobs);
      } catch (err: any) {
        console.error('Error loading jobs:', err);
        setError(err.message || 'Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndJobs();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/auth/login');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      // Mock apply functionality
      setMessage({ type: 'success', text: 'Application submitted!' });
      // In real app, update jobs to show applied status
      setJobs(jobs.map(job => 
        job.id === jobId 
          ? {
              ...job,
              applications: [...(job.applications || []), {
                id: `app-${Date.now()}`,
                worker_id: user.id,
                status: 'pending',
                profiles: {
                  full_name: user.full_name,
                  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.full_name,
                },
              }],
            }
          : job
      ));
    } catch (err: any) {
      console.error('Error applying to job:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to apply to job.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId: string, workerId: string, applicationId: string) => {
    setLoading(true);
    try {
      // Mock approval functionality
      setJobs(jobs.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: 'assigned' as const,
              worker_id: workerId,
              applications: job.applications.map(app =>
                app.id === applicationId
                  ? { ...app, status: 'approved' as const }
                  : { ...app, status: 'denied' as const }
              ),
            }
          : job
      ));
      setMessage({ type: 'success', text: 'Worker approved and job assigned!' });
    } catch (err: any) {
      console.error('Error approving worker:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to approve worker.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (applicationId: string) => {
    setLoading(true);
    try {
      // Mock deny functionality
      setJobs(jobs.map(job => ({
        ...job,
        applications: job.applications.map(app =>
          app.id === applicationId
            ? { ...app, status: 'denied' as const }
            : app
        ),
      })));
      setMessage({ type: 'success', text: 'Application denied.' });
    } catch (err: any) {
      console.error('Error denying application:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to deny application.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (targetUserId: string, jobId?: string) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to send messages.' });
      return;
    }

    setLoading(true);
    try {
      // Mock message functionality - just navigate to messages page
      router.push(`/messages`);
    } catch (err: any) {
      console.error('Error handling message:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to start conversation.' });
    } finally {
      setLoading(false);
    }
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
  const userCity = user.location.split(',')[0]?.trim() || user.location;

  if (isWorker && user.job_leads_used >= user.leads_limit) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white md:hidden">
              Jobs
            </h1>
            <div className="hidden md:block">
              <ModeToggle />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg">
            <p className="font-bold">You have reached your monthly limit</p>
            <p>You’ve used all {user.leads_limit} job leads this month.</p>
            <button
              onClick={() => router.push('/pricing')}
              className="mt-2 text-blue-600 hover:underline font-semibold"
            >
              Upgrade to apply to more jobs
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
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
              <button onClick={handleLogout} className="text-left text-lg font-medium">
                Log Out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {isWorker ? 'Available Jobs' : 'Your Posted Jobs'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isWorker
              ? `Jobs in ${userCity} and nearby areas`
              : 'Review and manage applicants for your jobs.'}
          </p>
        </div> {/* Closing div for mb-8 */}

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              {isWorker
                ? `No jobs in ${userCity} right now`
                : 'No jobs posted yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isWorker
                ? 'Jobs are added daily. Check back soon or update your location.'
                : 'Post your first job to receive applications from skilled workers.'}
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
                onClick={() => navigate('/post-job')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Post a Job
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {/* Job Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {job.description}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      job.status === 'open'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : job.status === 'assigned'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  {(job.min_budget || job.max_budget) && (
                    <div className="font-medium">
                      R {job.min_budget || ''} {job.min_budget && job.max_budget ? '-' : ''} {job.max_budget || ''}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isWorker ? (
                  <div className="flex justify-end gap-2">
                    {job.conversations && job.conversations.length > 0 && (
                      <button
                        onClick={() => handleMessage(job.customer_id, job.id)}
                        className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                    {job.status === 'open' && !job.applications.some(app => app.worker_id === user.id) && (
                      <button
                        onClick={() => handleApply(job.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Apply
                      </button>
                    )}
                    {job.applications.some(app => app.worker_id === user.id && app.status === 'pending') && (
                      <span className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">Applied (Pending)</span>
                    )}
                    {job.applications.some(app => app.worker_id === user.id && app.status === 'approved') && (
                      <span className="px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400">Approved!</span>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                      Applicants ({job.applications?.length || 0})
                    </h4>
                    {job.applications && job.applications.length > 0 ? (
                      <div className="space-y-3">
                        {job.applications.map((applicant) => (
                          <div
                            key={applicant.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={applicant.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.profiles?.full_name || 'User')}&background=4F46E5&color=fff`}
                                alt={applicant.profiles?.full_name || 'Applicant'}
                                className="w-10 h-10 rounded-full"
                              />
                              <span className="font-medium">
                                {applicant.profiles?.full_name}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {job.conversations && job.conversations.length > 0 && (
                                <button
                                  type="button"
                                  title="Message"
                                  onClick={() =>
                                    handleMessage(applicant.worker_id, job.id)
                                  }
                                  className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                              )}
                              {applicant.status === 'pending' && job.status === 'open' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApprove(job.id, applicant.worker_id, applicant.id)
                                    }
                                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                                    title="Approve"
                                  >
                                    <UserCheck className="w-5 h-5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeny(applicant.id)
                                    }
                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                                    title="Deny"
                                  >
                                    <UserX className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                              {applicant.status === 'approved' && (
                                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                  Approved
                                </span>
                              )}
                              {applicant.status === 'denied' && (
                                <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                                  Denied
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No applicants yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-6 text-center">
        <div className="container mx-auto px-4">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            Brinkify SA
          </span>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            © {new Date().getFullYear()} Connecting skilled workers with
            homeowners across South Africa.
          </p>
        </div>
      </footer>
    </div>
  );
}
