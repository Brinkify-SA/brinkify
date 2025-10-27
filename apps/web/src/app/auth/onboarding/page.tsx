// app/auth/onboarding/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { User, Mail, MapPin, Camera, Briefcase, Home, Tag, Check } from 'lucide-react';

// 🔒 Mock: In real app, get role from URL or auth context
// Example: /auth/onboarding?role=worker
export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState<'worker' | 'customer' | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: '',
    avatar: '',
    // Worker
    skills: [] as string[],
    bio: '',
    hourlyRate: '',
    // Customer
    preferredCategories: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get role from URL (e.g., /auth/onboarding?role=worker)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    if (roleParam === 'worker' || roleParam === 'customer') {
      setRole(roleParam);
    } else {
      // Default to customer if no role
      router.push('/auth/onboarding?role=customer' as any);
    }
  }, [router]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
   router.push(path as any);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, avatar: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !formData.preferredCategories.includes(newCategory.trim())) {
      setFormData({ ...formData, preferredCategories: [...formData.preferredCategories, newCategory.trim()] });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setFormData({ ...formData, preferredCategories: formData.preferredCategories.filter((c) => c !== category) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation
    if (!formData.fullName.trim() || !formData.location.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setLoading(false);
      return;
    }

    try {
      // ✅ In real app: call your Supabase API
      // Example:
      // await fetch('/api/onboarding', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, role }),
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ✅ On success: redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to complete onboarding. Please try again.' });
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  const isWorker = role === 'worker';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => router.push('/auth/signup')}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Check className="w-5 h-5" />
            <span className="hidden sm:inline">Skip</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            {isWorker ? 'Worker Onboarding' : 'Customer Onboarding'}
          </h1>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isWorker ? 'Complete Your Worker Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isWorker
                ? 'Help homeowners find and trust you.'
                : 'Tell us about your home needs.'}
            </p>
          </div>

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
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=4F46E5&color=fff`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                />
                <button
                  type="button"
                  title="Upload profile picture"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 shadow-md hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  title="Upload profile picture"
                  aria-label="Upload profile picture"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. Thabo Nkosi"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. Johannesburg, Sandton"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This helps us recommend local jobs.
              </p>
            </div>

            {/* Role-Specific Fields */}
            {isWorker ? (
              <>
                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
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
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
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
                    {formData.skills.map((skill, i) => (
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
              </>
            ) : (
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
                  {formData.preferredCategories.map((cat, i) => (
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? 'Completing...' : 'Complete Onboarding'}
            </button>
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
