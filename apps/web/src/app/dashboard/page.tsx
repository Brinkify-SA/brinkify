// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Home, Briefcase, MessageSquare, Star, Wallet, Settings, LogOut, User as UserIcon, Building, Users, BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Loader } from '@/components/loader'; // Assuming a Loader component exists

interface UserProfile {
  id: string;
  full_name: string; // Changed from name to full_name
  role: 'worker' | 'customer' | 'company';
  avatar_url: string;
  location: string;
  is_verified: boolean; // Changed from verified to is_verified
  plan_name: string;
  team_size?: number;
  job_leads_used?: number; // Changed from leads_used to job_leads_used
  leads_limit?: number;
  total_earnings?: number; // Added for worker
  average_rating?: number; // Added for worker
  total_spent?: number; // Added for customer
  saved_pros_count?: number; // Added for customer
  active_projects?: number; // Added for company
}

export default function DashboardPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/auth/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*, team_members(count), projects(count)') // Fetch counts for company-specific fields
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // Adjust profile data for company-specific counts
        const userProfile: UserProfile = {
          ...profile,
          team_size: profile.team_members?.[0]?.count || 0,
          active_projects: profile.projects?.[0]?.count || 0,
        };

        setUser(userProfile as UserProfile);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to load user profile.');
        router.push('/auth/login'); // Redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router, supabase]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any); // Cast to any to satisfy stricter Next.js 15.5.4 type
  };

  const handleLogout = () => {
    setUser(null);
    router.push('/auth/login');
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  if (loading) {
    return <Loader />; // Use the Loader component for loading state
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button onClick={() => router.push('/auth/login')} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go to Login
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* --- Navbar --- */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Brinkify SA
          </Link>
          <div className="hidden md:block"><ModeToggle /></div>
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
              <h1 className="text-2xl font-bold">Welcome back, {user.full_name}!</h1>
              <p className="opacity-90 mt-1">
                {user.role === 'worker'
                  ? `Available in ${user.location} • Manage your jobs and grow your reputation.`
                  : user.role === 'customer'
                  ? `Based in ${user.location} • Find trusted professionals for your home.`
                  : `Managing ${user.team_size || 0} workers • ${user.active_projects || 0} active projects in ${user.location}.`}
              </p>
              {!user.is_verified && (
                <div className="mt-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 rounded-md">
                  <p className="font-bold">Account Not Verified</p>
                  <p className="text-sm">Complete your profile to get verified.</p>
                  <button
                    onClick={handleEditProfile}
                    className="mt-1 text-sm font-bold text-yellow-800 hover:underline"
                  >
                    Get Verified
                  </button>
                </div>
              )}
              {/* Plan Usage */}
              <div className="mt-2 bg-blue-100/30 border border-blue-300 text-blue-800 p-2 rounded-md text-sm">
                <p>
                  <span className="font-bold">{user.plan_name} Plan</span> •{' '}
                  {user.role === 'worker'
                    ? `${user.job_leads_used || 0} of ${user.leads_limit || 5} job leads used`
                    : user.role === 'customer'
                    ? `Based in ${user.location}` // No leads for customer
                    : `${user.job_leads_used || 0} of ${user.leads_limit || 100} leads used`}
                </p>
                {user.role !== 'customer' && (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="mt-1 text-sm font-bold text-blue-800 hover:underline"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <img
                src={user.avatar_url}
                alt={user.full_name}
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

        {/* Role-Specific Dashboard */}
        {user.role === 'worker' ? (
          <WorkerDashboard user={user} />
        ) : user.role === 'customer' ? (
          <CustomerDashboard user={user} />
        ) : (
          <CompanyDashboard user={user} />
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

// ======================
// Worker Dashboard
// ======================
function WorkerDashboard({ user }: { user: UserProfile }) {
  const [stats, setStats] = useState([
    { label: 'Active Jobs', value: '0', change: '' },
    { label: 'Total Earnings', value: 'R 0', change: '' },
    { label: 'Avg. Rating', value: '0.0', change: '' },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchWorkerStats = async () => {
      setLoadingStats(true);
      try {
        // Fetch active jobs
        const { count: activeJobsCount, error: jobsError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .eq('worker_id', user.id)
          .in('status', ['assigned', 'in-progress']); // Filter for active jobs

        if (jobsError) throw jobsError;

        setStats([
          { label: 'Active Jobs', value: activeJobsCount?.toString() || '0', change: '' },
          { label: 'Total Earnings', value: `R ${user.total_earnings?.toLocaleString() || '0'}`, change: '' },
          { label: 'Avg. Rating', value: user.average_rating?.toFixed(1) || '0.0', change: '⭐' },
        ]);
      } catch (error) {
        console.error('Error fetching worker stats:', error);
        // Optionally set an error state for the worker dashboard
      } finally {
        setLoadingStats(false);
      }
    };

    fetchWorkerStats();
  }, [user.id, user.total_earnings, user.average_rating, supabase]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingStats ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
          </>
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              {stat.change && <p className="text-green-600 text-sm mt-1">{stat.change}</p>}
            </div>
          ))
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/jobs" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <Briefcase className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>View Jobs</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Messages</span>
          </Link>
          <Link href="/pricing" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <Wallet className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>View Plans</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ========================
// Customer Dashboard
// ========================
function CustomerDashboard({ user }: { user: UserProfile }) {
  const [stats, setStats] = useState([
    { label: 'Active Jobs', value: '0', change: '' },
    { label: 'Total Spent', value: 'R 0', change: '' },
    { label: 'Saved Pros', value: '0', change: '' },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCustomerStats = async () => {
      setLoadingStats(true);
      try {
        // Fetch active jobs posted by the customer
        const { count: activeJobsCount, error: jobsError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .eq('customer_id', user.id)
          .in('status', ['open', 'assigned', 'in-progress']); // Filter for active jobs

        if (jobsError) throw jobsError;

        setStats([
          { label: 'Active Jobs', value: activeJobsCount?.toString() || '0', change: '' },
          { label: 'Total Spent', value: `R ${user.total_spent?.toLocaleString() || '0'}`, change: '' },
          { label: 'Saved Pros', value: user.saved_pros_count?.toString() || '0', change: '' },
        ]);
      } catch (error) {
        console.error('Error fetching customer stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchCustomerStats();
  }, [user.id, user.total_spent, user.saved_pros_count, supabase]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingStats ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
          </>
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              {stat.change && <p className="text-gray-500 text-sm mt-1">{stat.change}</p>}
            </div>
          ))
        )}
      </div>

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
    </div>
  );
}

// ========================
// Company Dashboard
// ========================
interface CompanyProject {
  id: string;
  title: string;
  client_name: string; // Assuming client_name in projects table
  status: string;
  created_at: string;
}

function CompanyDashboard({ user }: { user: UserProfile }) {
  const [stats, setStats] = useState([
    { label: 'Team Members', value: user.team_size?.toString() || '0', icon: Users },
    { label: 'Active Projects', value: user.active_projects?.toString() || '0', icon: Briefcase },
    { label: 'Leads Used', value: `${user.job_leads_used || 0}/${user.leads_limit || 100}`, icon: BarChart3 },
  ]);
  const [recentProjects, setRecentProjects] = useState<CompanyProject[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCompanyStats = async () => {
      setLoadingStats(true);
      try {
        setStats([
          { label: 'Team Members', value: user.team_size?.toString() || '0', icon: Users },
          { label: 'Active Projects', value: user.active_projects?.toString() || '0', icon: Briefcase },
          { label: 'Leads Used', value: `${user.job_leads_used || 0}/${user.leads_limit || 100}`, icon: BarChart3 },
        ]);
      } catch (error) {
        console.error('Error fetching company stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchRecentProjects = async () => {
      setLoadingProjects(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, client_name, status, created_at')
          .eq('company_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);

        if (error) throw error;
        setRecentProjects(data as CompanyProject[]);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchCompanyStats();
    fetchRecentProjects();
  }, [user.id, user.leads_limit, user.job_leads_used, user.team_size, user.active_projects, supabase]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingStats ? (
          <>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse h-28"></div>
          </>
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Business Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/company/team" as="/company/team" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <Users className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Team</span>
          </Link>
          <Link href="/company/projects" as="/company/projects" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <Briefcase className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Projects</span>
          </Link>
          <Link href="/messages" as="/messages" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <MessageSquare className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Messages</span>
          </Link>
          <Link href="/pricing" as="/pricing" className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            <Wallet className="text-blue-600 dark:text-blue-400 mb-2" />
            <span>Upgrade Plan</span>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Projects</h2>
          <Link href="/company/projects" as="/company/projects" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {loadingProjects ? (
            <>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 animate-pulse h-16"></div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 animate-pulse h-16"></div>
            </>
          ) : recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <div key={project.id} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">For {project.client_name} • {new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  project.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {project.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No recent projects found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
