// app/company/projects/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { Briefcase, MapPin, Clock, User, CheckCircle, Star, Plus, Search } from 'lucide-react';

const MOCK_COMPANY = {
  id: 'comp_001',
  name: 'ABC Construction',
  role: 'company',
  avatar: 'https://ui-avatars.com/api/?name=ABC+Construction&background=10B981&color=fff',
};

const MOCK_PROJECTS = [
  {
    id: 'p1',
    title: 'Office Renovation',
    clientName: 'TechStart Ltd',
    clientLocation: 'Johannesburg, Sandton',
    status: 'in-progress',
    startDate: '2025-10-20',
    endDate: '2025-11-15',
    teamSize: 5,
    budget: 'R 85,000',
    rating: null,
  },
  {
    id: 'p2',
    title: 'Retail Store Fit-Out',
    clientName: 'Urban Wear',
    clientLocation: 'Cape Town, V&A Waterfront',
    status: 'completed',
    startDate: '2025-09-10',
    endDate: '2025-10-05',
    teamSize: 8,
    budget: 'R 120,000',
    rating: 4.9,
  },
  {
    id: 'p3',
    title: 'Warehouse Electrical Upgrade',
    clientName: 'LogiCorp SA',
    clientLocation: 'Durban, Industrial Hub',
    status: 'pending',
    startDate: '2025-11-01',
    endDate: '2025-12-10',
    teamSize: 3,
    budget: 'R 42,500',
    rating: null,
  },
];

export default function CompanyProjectsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleLogout = () => {
    router.push('/auth/login');
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const filteredProjects = MOCK_PROJECTS.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase()) ||
    project.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded">Completed</span>;
      case 'in-progress':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded">In Progress</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-2 py-1 rounded">Pending</span>;
      default:
        return <span className="text-xs px-2 py-1 rounded">Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={handleBack} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Projects</h1>
          <div className="hidden md:block"><ModeToggle /></div>
          <button onClick={toggleMenu} className="md:hidden text-blue-600 dark:text-blue-400 focus:outline-none" aria-label="Toggle menu">
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
              <button onClick={() => navigate('/dashboard')} className="text-left text-lg font-medium">Dashboard</button>
              <button onClick={() => navigate('/profile/edit')} className="text-left text-lg font-medium">Edit Profile</button>
              <button onClick={handleLogout} className="text-left text-lg font-medium">Log Out</button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Project Management</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Projects</p>
            <p className="text-2xl font-bold mt-1">24</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
            <p className="text-2xl font-bold mt-1">8</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
            <p className="text-2xl font-bold mt-1">16</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Rating</p>
            <p className="text-2xl font-bold mt-1">4.8 ⭐</p>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-bold text-lg text-gray-800 dark:text-white">{project.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">For {project.clientName}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project.clientLocation}</div>
                    <div className="flex items-center gap-1"><User className="w-4 h-4" /> {project.teamSize} workers</div>
                    <div className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {project.budget}</div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {project.startDate} → {project.endDate}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(project.status)}
                  {project.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{project.rating}</span>
                    </div>
                  )}
                  <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
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