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

// Mock user and job data
const MOCK_USER = {
  id: 'user_456',
  name: 'Sarah K.',
  role: 'customer', // Try 'worker' or 'customer'
  location: 'Johannesburg, Sandton',
};

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
      conversationId: 'conv_001',
    },
  ],
  customerJobs: [
    {
      id: 'job_101',
      title: 'Bathroom tiling',
      description: 'Replace old tiles in main bathroom.',
      location: 'Johannesburg, Sandton',
      budget: 'R 3,200',
      postedAt: '2025-10-22',
      workerId: null,
      status: 'open',
      applicants: [
        {
          id: 'work_001',
          name: 'John D.',
          avatar:
            'https://ui-avatars.com/api/?name=John+D&background=4F46E5&color=fff',
          status: 'pending',
          conversationId: 'conv_101',
        },
        {
          id: 'work_002',
          name: 'Lerato P.',
          avatar:
            'https://ui-avatars.com/api/?name=Lerato+P&background=F59E0B&color=fff',
          status: 'pending',
          conversationId: 'conv_102',
        },
      ],
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

  const handleApply = (jobId: string) => {
    console.log(`Applying to job: ${jobId}`);
    // In a real app, you'd send this to a backend.
    // For this mock, we'll just log it and navigate.
    alert('Application submitted!');
    router.push('/my-jobs');
  };

  const handleApprove = (jobId: string, workerId: string) => {
    console.log(`Approving worker ${workerId} for job ${jobId}`);
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            status: 'assigned',
            workerId: workerId,
            applicants: job.applicants.map((applicant: any) =>
              applicant.id === workerId
                ? { ...applicant, status: 'approved' }
                : { ...applicant, status: 'denied' }
            ),
          };
        }
        return job;
      })
    );
  };

  const handleDeny = (jobId: string, workerId: string) => {
    console.log(`Denying worker ${workerId} for job ${jobId}`);
    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            applicants: job.applicants.map((applicant: any) =>
              applicant.id === workerId
                ? { ...applicant, status: 'denied' }
                : applicant
            ),
          };
        }
        return job;
      })
    );
  };

  const handleMessage = (conversationId?: string) => {
    if (conversationId) router.push(`/messages/${conversationId}`);
    else router.push('/messages');
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
        </div>

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
                    Posted {job.postedAt}
                  </div>
                  <div className="font-medium">{job.budget}</div>
                </div>

                {/* Actions */}
                {isWorker ? (
                  <div className="flex justify-end gap-2">
                    {job?.conversationId && (
                      <button
                        onClick={() => handleMessage(job?.conversationId)}
                        className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}
                    {job.status === 'open' && (
                      <button
                        onClick={() => handleApply(job.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                      Applicants ({job.applicants?.length || 0})
                    </h4>
                    {job.applicants && job.applicants.length > 0 ? (
                      <div className="space-y-3">
                        {job.applicants.map((applicant: any) => (
                          <div
                            key={applicant.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={applicant.avatar}
                                alt={applicant.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <span className="font-medium">
                                {applicant.name}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {applicant?.conversationId && (
                                <button
                                  type="button"
                                  title="Message"
                                  onClick={() =>
                                    handleMessage(applicant?.conversationId)
                                  }
                                  className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                              )}
                              {applicant.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApprove(job.id, applicant.id)
                                    }
                                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                                    title="Approve"
                                  >
                                    <UserCheck className="w-5 h-5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeny(job.id, applicant.id)
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
