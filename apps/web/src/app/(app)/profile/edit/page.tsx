// app/profile/edit/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { User, Mail, MapPin, Camera, Star, Briefcase, Home, Tag, X, Link as LinkIcon, Banknote } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Loader from '@/components/loader'; // Assuming a Loader component exists

interface UserProfile {
  id: string;
  full_name: string; // Changed from name to full_name
  email: string;
  role: 'worker' | 'customer' | 'company';
  location: string;
  avatar_url: string;
  skills?: string[];
  bio?: string;
  hourly_rate?: string;
  portfolio?: { title: string; url: string }[];
  bank_name?: string;
  account_number?: string;
  branch_code?: string;
  id_number?: string; // Added id_number
  preferred_categories?: string[];
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    full_name: '', // Changed from name to full_name
    email: '',
    role: 'worker', // Default role, will be overwritten by fetched data
    location: '',
    avatar_url: '',
    skills: [],
    bio: '',
    hourly_rate: '',
    portfolio: [],
    bank_name: '',
    account_number: '',
    branch_code: '',
    id_number: '', // Added id_number
    preferred_categories: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true); // Set to true initially for data fetching
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/auth/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setUser(profile as UserProfile);
        setFormData({
          id: profile.id,
          full_name: profile.full_name || '', // Changed from name to full_name
          email: authUser.email || '', // Email from auth user
          role: profile.role || 'worker',
          location: profile.location || '',
          avatar_url: profile.avatar_url || '',
          skills: profile.skills || [],
          bio: profile.bio || '',
          hourly_rate: profile.hourly_rate || '',
          portfolio: profile.portfolio || [],
          bank_name: profile.bank_name || '',
          account_number: profile.account_number || '',
          branch_code: profile.branch_code || '',
          id_number: profile.id_number || '', // Added id_number
          preferred_categories: profile.preferred_categories || [],
        });
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setMessage({ type: 'error', text: err.message || 'Failed to load user profile.' });
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
    router.push(path as any);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setLoading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars') // Assuming a 'avatars' bucket exists in Supabase Storage
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

        setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
        setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
      } catch (error: any) {
        console.error('Error uploading avatar:', error);
        setMessage({ type: 'error', text: error.message || 'Failed to upload avatar.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skill),
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !formData.preferred_categories?.includes(newCategory.trim())) {
      setFormData((prev) => ({
        ...prev,
        preferred_categories: [...(prev.preferred_categories || []), newCategory.trim()],
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_categories: (prev.preferred_categories || []).filter((c) => c !== category),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!user) {
      setMessage({ type: 'error', text: 'User not authenticated.' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name, // Changed from name to full_name
          location: formData.location,
          avatar_url: formData.avatar_url,
          skills: formData.skills,
          bio: formData.bio,
          hourly_rate: formData.hourly_rate,
          portfolio: formData.portfolio,
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          branch_code: formData.branch_code,
          id_number: formData.id_number, // Added id_number
          preferred_categories: formData.preferred_categories,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (message?.type === 'error' && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: {message.text}</p>
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

  const isWorker = user.role === 'worker';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* --- Navbar --- */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={handleCancel} className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Cancel</span>
          </button>

          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Edit Profile</h1>

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
      <main className="flex-grow container mx-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={formData.avatar_url || 'https://ui-avatars.com/api/?name=User&background=random&color=fff'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 shadow-md hover:bg-blue-700"
                  title="Change profile picture"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  aria-label="Change profile picture"
                  title="Change profile picture"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled // Email should not be editable here, it's from auth
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-not-allowed"
                />
              </div>
            </div>

            {/* Location — CRITICAL FOR JOB MATCHING */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Johannesburg, Sandton"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your location helps us recommend nearby jobs.
              </p>
            </div>

            {/* Worker-Specific Fields */}
            {isWorker && (
              <>
                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Tell customers about your experience..."
                  />
                </div>

                {/* Hourly Rate */}
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hourly Rate (ZAR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">R</span>
                    <input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourly_rate || ''}
                      onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.skills || []).map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portfolio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio
                  </label>
                  {(formData.portfolio || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <LinkIcon className="w-4 h-4 text-gray-400" />
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {item.title}
                      </a>
                    </div>
                  ))}
                  {/* Add portfolio item form could be added here */}
                </div>

                {/* Banking Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banking Details
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.bank_name || ''}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        placeholder="Bank Name"
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.account_number || ''}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      placeholder="Account Number"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                    <input
                      type="text"
                      value={formData.branch_code || ''}
                      onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
                      placeholder="Branch Code"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                    <input
                      type="text"
                      value={formData.id_number || ''}
                      onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                      placeholder="ID Number"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Customer-Specific Fields */}
            {!isWorker && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Job Categories
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Electricians"
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.preferred_categories || []).map((cat, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2.5 py-1 rounded-full text-sm"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="ml-1 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
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
