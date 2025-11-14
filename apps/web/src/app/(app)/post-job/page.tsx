// app/post-job/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Home,
  Tag,
  MapPin,
  Calendar,
  DollarSign,
  Camera,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Loader from '@/components/loader'; // Assuming a Loader component exists

interface JobFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  min_budget?: number;
  max_budget?: number;
  preferred_date?: string;
  images?: string[]; // Array of public URLs
  customer_id: string;
}

interface UserProfile {
  id: string;
  full_name: string; // Changed from name to full_name
  role: 'worker' | 'customer' | 'company';
  location: string;
}

// 📋 Job categories (same as Explore page)
const CATEGORIES = [
  { id: 'electricians', name: 'Electricians', icon: '⚡' },
  { id: 'plumbers', name: 'Plumbers', icon: '💧' },
  { id: 'carpenters', name: 'Carpenters', icon: '🪚' },
  { id: 'painters', name: 'Painters', icon: '🎨' },
  { id: 'handymen', name: 'Handymen', icon: '🛠️' },
  { id: 'gardeners', name: 'Gardeners', icon: '🌿' },
  { id: 'cleaners', name: 'Cleaners', icon: '🧹' },
  { id: 'tilers', name: 'Tilers', icon: '🧱' },
];

export default function PostJobPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    images: [],
    customer_id: '',
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
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
          .select('id, full_name, role, location') // Select full_name instead of name
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (profile.role !== 'customer') {
          router.push('/dashboard');
          return;
        }

        setUser(profile as UserProfile);
        setFormData((prev) => ({
          ...prev,
          customer_id: profile.id,
          location: profile.location || '',
        }));
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
    router.push('/auth/login' as any);
  };

  const handleBack = () => {
    router.push('/dashboard' as any);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + (formData.images?.length || 0) > 4) {
      setMessage({ type: 'error', text: 'You can upload up to 4 images.' });
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          setMessage({ type: 'error', text: `Image ${file.name} must be less than 5MB.` });
          setLoading(false);
          return;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${formData.customer_id}-${Math.random()}.${fileExt}`;
        const filePath = `job_images/${fileName}`; // Assuming a 'job_images' bucket

        const { error: uploadError } = await supabase.storage
          .from('job_images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('job_images').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      setPreviewImages((prev) => [...prev, ...uploadedUrls]);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
      setMessage({ type: 'success', text: 'Images uploaded successfully!' });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload images.' });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrlToRemove = previewImages[index];
    if (!imageUrlToRemove) return;

    setLoading(true);
    try {
      // Extract file path from public URL
      const urlParts = imageUrlToRemove.split('/');
      const filePath = `job_images/${urlParts[urlParts.length - 1]}`; // Assuming 'job_images' bucket

      const { error: deleteError } = await supabase.storage
        .from('job_images')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
      setFormData((prev) => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index),
      }));
      setMessage({ type: 'success', text: 'Image removed successfully!' });
    } catch (error: any) {
      console.error('Error removing image:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to remove image.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!user || user.role !== 'customer') {
      setMessage({ type: 'error', text: 'Only customers can post jobs.' });
      setLoading(false);
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.location.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          min_budget: formData.min_budget ? parseFloat(formData.min_budget.toString()) : null,
          max_budget: formData.max_budget ? parseFloat(formData.max_budget.toString()) : null,
          preferred_date: formData.preferred_date || null,
          images: formData.images,
          customer_id: formData.customer_id,
          status: 'open', // Default status for new jobs, as per schema.sql
        });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Job posted successfully! Redirecting to My Jobs...' });
      router.push('/my-jobs');
    } catch (err: any) {
      console.error('Error posting job:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to post job. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!user || user.role !== 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Access Denied: Only customers can post jobs.</p>
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
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            aria-label="Back to dashboard"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Cancel</span>
          </button>

          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Post a Job</h1>

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
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Fix leaking kitchen tap"
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe the job in detail. Include materials, access instructions, etc."
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition ${
                      formData.category === cat.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-medium">{cat.name}</span>
                  </button>
                ))}
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
                  placeholder="e.g. Johannesburg, Sandton"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget (Optional)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <label htmlFor="minBudget" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Budget
                  </label>
                  <span className="absolute left-3 top-10 transform -translate-y-1/2 text-gray-500 font-semibold">R</span>
                  <input
                    id="minBudget"
                    type="number"
                    value={formData.min_budget || ''}
                    onChange={(e) => setFormData({ ...formData, min_budget: parseFloat(e.target.value) || undefined })}
                    min="0"
                    placeholder="e.g. 500"
                    className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="flex-1 relative">
                  <label htmlFor="maxBudget" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maximum Budget
                  </label>
                  <span className="absolute left-3 top-10 transform -translate-y-1/2 text-gray-500 font-semibold">R</span>
                  <input
                    id="maxBudget"
                    type="number"
                    value={formData.max_budget || ''}
                    onChange={(e) => setFormData({ ...formData, max_budget: parseFloat(e.target.value) || undefined })}
                    min="0"
                    placeholder="e.g. 1500"
                    className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preferred Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="preferredDate"
                  type="date"
                  value={formData.preferred_date || ''}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photos (Optional, max 4)
              </label>
              <div className="flex gap-2 flex-wrap">
                {previewImages.map((src, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
<button
  type="button"
  onClick={() => removeImage(i)}
  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
  aria-label="Remove image"
>
  <X className="w-3 h-3" />
</button>
                  </div>
                ))}
                {(formData.images?.length || 0) < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-500 transition"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                  aria-label="Upload photos"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Help workers understand the job better with photos.
              </p>
            </div>

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
              {loading ? 'Posting Job...' : 'Post Job'}
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
