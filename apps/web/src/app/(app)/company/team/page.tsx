// app/company/team/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { User, Mail, MapPin, Star, Users, Plus, Search } from 'lucide-react';

// 🔒 Mock company user
const MOCK_COMPANY = {
  id: 'comp_001',
  name: 'ABC Construction',
  role: 'company',
  avatar: 'https://ui-avatars.com/api/?name=ABC+Construction&background=10B981&color=fff',
};

// 📋 Mock team members
const MOCK_TEAM = [
  {
    id: 'w1',
    name: 'Thabo N.',
    email: 'thabo@example.com',
    location: 'Johannesburg, Sandton',
    role: 'Electrician',
    rating: 4.8,
    jobsCompleted: 12,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Thabo+N&background=4F46E5&color=fff',
  },
  {
    id: 'w2',
    name: 'Lerato P.',
    email: 'lerato@example.com',
    location: 'Durban, Umhlanga',
    role: 'Gardener',
    rating: 4.9,
    jobsCompleted: 8,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Lerato+P&background=F59E0B&color=fff',
  },
  {
    id: 'w3',
    name: 'James B.',
    email: 'james@example.com',
    location: 'Pretoria, Hatfield',
    role: 'Painter',
    rating: 4.7,
    jobsCompleted: 5,
    status: 'pending', // invited but not accepted
    avatar: 'https://ui-avatars.com/api/?name=James+B&background=8B5CF6&color=fff',
  },
];

export default function CompanyTeamPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState(MOCK_TEAM);
  const [selectedMember, setSelectedMember] = useState<typeof MOCK_TEAM[0] | null>(null);

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

  const filteredTeam = team.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleInviteWorker = () => {
    router.push('/company/invite' as any);
  };

  const handleRemoveMember = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
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
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">My Team</h1>
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Team Management</h1>
          <button onClick={handleInviteWorker} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Invite Worker
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Team Size</p>
            <p className="text-2xl font-bold mt-1">8</p>
            <p className="text-green-600 text-sm mt-1">+2 this month</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Active Workers</p>
            <p className="text-2xl font-bold mt-1">6</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Rating</p>
            <p className="text-2xl font-bold mt-1">4.8 ⭐</p>
          </div>
        </div>

        {/* Team List */}
        <div className="space-y-4">
          {filteredTeam.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full" />
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between gap-2">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white">{member.name}</h2>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {member.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1"><Mail className="w-4 h-4" /> {member.email}</div>
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {member.location}</div>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {member.rating} ({member.jobsCompleted} jobs)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSelectedMember(member)} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">View Profile</button>
                  <button onClick={() => handleRemoveMember(member.id)} className="text-gray-600 dark:text-gray-400 hover:underline text-sm font-medium">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMember.name}</h2>
                <button onClick={() => setSelectedMember(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <img src={selectedMember.avatar} alt={selectedMember.name} className="w-24 h-24 rounded-full mb-4" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedMember.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedMember.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {selectedMember.rating} ({selectedMember.jobsCompleted} jobs)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMember.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {selectedMember.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      

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