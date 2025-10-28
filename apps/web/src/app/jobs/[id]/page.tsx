// app/jobs/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Briefcase, 
  MessageCircle, 
  UserCheck, 
  UserX, 
  ArrowLeft 
} from 'lucide-react';

// 🔒 Mock current user
const MOCK_CURRENT_USER = {
  id: 'user_456', // Change to 'user_123' for worker
  name: 'Sarah K.',
  role: 'customer', // 'worker' or 'customer'
  avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=10B981&color=fff',
};

// 📋 Mock job data
const MOCK_JOBS: Record<string, any> = {
  job_001: {
    id: 'job_001',
    title: 'Fix kitchen light',
    description: 'Light not turning on. Need electrician ASAP.',
    location: 'Pretoria, Centurion',
    budgetType: 'fixed',
    budgetAmount: 450,
    postedAt: '2025-10-25',
    status: 'open',
    customer: {
      id: 'user_456',
      name: 'Sarah K.',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=10B981&color=fff',
    },
    applicants: [
      {
        id: 'work_001',
        name: 'John D.',
        avatar: 'https://ui-avatars.com/api/?name=John+D&background=4F46E5&color=fff',
        status: 'pending',
        conversationId: 'conv_101',
      },
      {
        id: 'work_002',
        name: 'Lerato P.',
        avatar: 'https://ui-avatars.com/api/?name=Lerato+P&background=F59E0B&color=fff',
        status: 'pending',
        conversationId: 'conv_102',
      },
    ],
  },
  job_101: {
    id: 'job_101',
    title: 'Bathroom tiling',
    description: 'Replace old tiles in main bathroom.',
    location: 'Johannesburg, Sandton',
    budgetType: 'fixed',
    budgetAmount: 3200,
    postedAt: '2025-10-22',
    status: 'assigned',
    customer: {
      id: 'user_456',
      name: 'Sarah K.',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=10B981&color=fff',
    },
    worker: {
      id: 'work_001',
      name: 'John D.',
      avatar: 'https://ui-avatars.com/api/?name=John+D&background=4F46E5&color=fff',
      conversationId: 'conv_101',
    },
  },
};

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const jobId = Array.isArray(id) ? id[0] : id;

  const [user, setUser] = useState<typeof MOCK_CURRENT_USER | null>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(MOCK_CURRENT_USER);
    if (jobId && MOCK_JOBS[jobId]) {
      setJob(MOCK_JOBS[jobId]);
    }
    setLoading(false);
  }, [jobId]);

  const isWorker = user?.role === 'worker';
  const isOwner = job?.customer?.id === user?.id;
  const isAssignedWorker = job?.worker?.id === user?.id;

  const handleBack = () => router.push('/jobs');
  const handleMessage = (convId: string) => router.push(`/messages/${convId}`);
  const handleApply = () => {
    console.log('Applying to job...');
    // In real app: call API
    alert('Application submitted!');
  };
  const handleApprove = (workerId: string) => {
    console.log(`Approving worker ${workerId}`);
    alert('Worker approved!');
  };
  const handleDeny = (workerId: string) => {
    console.log(`Denying worker ${workerId}`);
    alert('Worker denied.');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={handleBack} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Jobs</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate">{job.title}</h1>
          <div className="ml-auto hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Job Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{job.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
              job.status === 'assigned' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {job.status.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>Posted {job.postedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>
                {job.budgetType === 'hourly' ? 'R' + job.budgetAmount + '/hr' : 'R ' + job.budgetAmount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isWorker ? (
                <>
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Posted by: {job.customer.name}</span>
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Category: Electricians</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            {isWorker && job.status === 'open' && (
              <button
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Apply
              </button>
            )}

            {isOwner && job.status === 'open' && job.applicants?.length > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Review {job.applicants.length} applicants
              </span>
            )}

            {isAssignedWorker && (
              <button
                onClick={() => job.worker && handleMessage(job.worker.conversationId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Message Customer
              </button>
            )}
          </div>
        </div>

        {/* Applicants Section (for Homeowners) */}
        {isOwner && job.status === 'open' && job.applicants && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Applicants ({job.applicants.length})
            </h2>
            <div className="space-y-4">
              {job.applicants.map((applicant: any) => (
                <div key={applicant.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={applicant.avatar}
                      alt={applicant.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="font-medium">{applicant.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      title="Message"
                      onClick={() => handleMessage(applicant.conversationId)}
                      className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    {applicant.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(applicant.id)}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full"
                          title="Approve"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeny(applicant.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                          title="Deny"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Worker (for Homeowners) */}
        {isOwner && job.worker && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Assigned Worker</h2>
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={job.worker.avatar}
                  alt={job.worker.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{job.worker.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status: {job.status}</p>
                </div>
              </div>
              <button
                onClick={() => handleMessage(job.worker.conversationId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4" /> Message
              </button>
            </div>
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
