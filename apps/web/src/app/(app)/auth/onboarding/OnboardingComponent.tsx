'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { User, Mail, MapPin, Camera, Briefcase, Home, Building, Tag, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Loader from '@/components/loader'; // Assuming a Loader component exists

interface OnboardingFormData {
  id: string;
  full_name: string; // Changed from name to full_name
  email: string;
  role: 'worker' | 'customer' | 'company';
  location: string;
  avatar_url: string;
  skills?: string[];
  bio?: string;
  hourly_rate?: string;
  portfolio?: string[]; // Array of public URLs
  bank_name?: string;
  account_number?: string;
  branch_code?: string;
  id_number?: string;
  company_name?: string;
}

export default function OnboardingComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState<'worker' | 'customer' | 'company' | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>({
    id: '',
    full_name: '', // Changed from name to full_name
    email: '',
    role: 'worker', // Default, will be updated
    location: '',
    avatar_url: '',
    skills: [],
    bio: '',
    hourly_rate: '',
    portfolio: [],
    bank_name: '',
    account_number: '',
    branch_code: '',
    id_number: '',
    company_name: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true); // Set to true initially for auth check
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const initializeOnboarding = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/auth/login');
          return;
        }

        const roleParam = searchParams.get('role');
        const userRole = ['worker', 'customer', 'company'].includes(roleParam || '')
          ? (roleParam as 'worker' | 'customer' | 'company')
          : 'company'; // Default to company if role is not specified or invalid

    setRole(userRole);
    setFormData((prev: OnboardingFormData) => ({
      ...prev,
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name || '', // Pre-fill full_name if available from auth
      avatar_url: authUser.user_metadata?.avatar_url || '', // Pre-fill avatar if available
      role: userRole,
    }));
      } catch (err: any) {
        console.error('Error initializing onboarding:', err);
        setMessage({ type: 'error', text: err.message || 'Failed to initialize onboarding.' });
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    initializeOnboarding();
  }, [searchParams, router, supabase]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + (formData.portfolio?.length || 0) > 6) {
      setMessage({ type: 'error', text: 'You can upload up to 6 portfolio images.' });
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
        const fileName = `${formData.id}-${Math.random()}.${fileExt}`;
        const filePath = `portfolio/${fileName}`; // Assuming a 'portfolio' bucket

        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      setPreviewImages((prev) => [...prev, ...uploadedUrls]);
      setFormData((prev) => ({
        ...prev,
        portfolio: [...(prev.portfolio || []), ...uploadedUrls],
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
      const filePath = `portfolio/${urlParts[urlParts.length - 1]}`; // Assuming 'portfolio' bucket

      const { error: deleteError } = await supabase.storage
        .from('portfolio')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      setPreviewImages((prev: string[]) => prev.filter((_, i) => i !== index));
      setFormData((prev: OnboardingFormData) => ({
        ...prev,
        portfolio: (prev.portfolio || []).filter((_, i) => i !== index),
      }));
      setMessage({ type: 'success', text: 'Image removed successfully!' });
    } catch (error: any) {
      console.error('Error removing image:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to remove image.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData((prev: OnboardingFormData) => ({ ...prev, skills: [...(prev.skills || []), newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev: OnboardingFormData) => ({ ...prev, skills: (prev.skills || []).filter((s) => s !== skill) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.id) {
      setMessage({ type: 'error', text: 'User ID is missing. Please log in again.' });
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.full_name.trim() || !formData.location.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setLoading(false);
      return;
    }

    if (role === 'worker') {
      if ((formData.portfolio?.length || 0) < 3) {
        setMessage({ type: 'error', text: 'Please upload at least 3 portfolio images.' });
        setLoading(false);
        return;
      }
      if (!formData.bank_name || !formData.account_number || !formData.id_number) {
        setMessage({ type: 'error', text: 'Banking and ID details are required for workers.' });
        setLoading(false);
        return;
      }
    }

    if (role === 'company' && !formData.company_name?.trim()) {
      setMessage({ type: 'error', text: 'Company Name is required for companies.' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name, // Changed from name to full_name
          role: formData.role,
          location: formData.location,
          avatar_url: formData.avatar_url,
          skills: formData.skills,
          bio: formData.bio,
          hourly_rate: formData.hourly_rate,
          portfolio: formData.portfolio,
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          branch_code: formData.branch_code,
          id_number: formData.id_number,
          company_name: formData.company_name,
        })
        .eq('id', formData.id);

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Onboarding complete! Redirecting to dashboard...' });
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to complete onboarding. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Error: Role not determined. Please try again.</p>
        <button onClick={() => router.push('/auth/login')} className="ml-4 text-blue-600 dark:text-blue-400 hover:underline">
          Go to Login
        </button>
      </div>
    );
  }

  const isWorker = role === 'worker';
  const isCompany = role === 'company';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => router.push('/auth/signup')}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            {isWorker ? 'Worker Onboarding' : isCompany ? 'Company Onboarding' : 'Customer Onboarding'}
          </h1>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isWorker
                ? 'Complete Your Worker Profile'
                : isCompany
                ? 'Complete Your Company Profile'
                : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isWorker
                ? 'Showcase your skills and get verified to start receiving jobs.'
                : isCompany
                ? 'Tell us about your business and hiring needs.'
                : 'Help us match you with the right professionals.'}
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
                  src={formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'User')}&background=4F46E5&color=fff`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                />
                <button
                  type="button"
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
                  title="Upload avatar"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g. Thabo Nkosi"
                />
              </div>
            </div>

            {/* Company Name (if company) */}
            {isCompany && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="companyName"
                    type="text"
                    value={formData.company_name || ''}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. ABC Construction"
                  />
                </div>
              </div>
            )}

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
                This helps us recommend local opportunities.
              </p>
            </div>

            {/* Worker-Specific Fields */}
            {isWorker && (
              <>
                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Professional Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Describe your experience, certifications, and services..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills <span className="text-red-500">*</span>
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
                    Portfolio Images <span className="text-red-500">*(Min 3)</span>
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
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {(formData.portfolio?.length || 0) < 6 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-500 transition"
                      >
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-xs">Add</span>
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Show your best work. Minimum 3 images required for approval.
                  </p>
                </div>

                {/* Banking Details */}
<h3 className="text-lg font-bold text-gray-800 dark:text-white mt-6 mb-4">
  Banking Details (for Payouts)
</h3>
<div className="space-y-4">
  <div>
    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Select Your Bank <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <select
        id="bankName"
        value={formData.bank_name || ''}
        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
        required
        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      >
        <option value="">-- Select Bank --</option>
        <option value="Absa Bank">Absa Bank</option>
        <option value="Standard Bank">Standard Bank</option>
        <option value="First National Bank (FNB)">First National Bank (FNB)</option>
        <option value="Nedbank">Nedbank</option>
        <option value="Capitec Bank">Capitec Bank</option>
        <option value="TymeBank">TymeBank</option>
        <option value="African Bank">African Bank</option>
        <option value="Discovery Bank">Discovery Bank</option>
        <option value="Investec">Investec</option>
        <option value="Old Mutual Bank">Old Mutual Bank</option>
      </select>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Account Number <span className="text-red-500">*</span>
      </label>
      <input
        id="accountNumber"
        type="text"
        value={formData.account_number || ''}
        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
        required
        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        placeholder="123456789"
      />
    </div>
    <div>
      <label htmlFor="branchCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Branch Code <span className="text-red-500">*</span>
      </label>
      <input
        id="branchCode"
        type="text"
        value={formData.branch_code || ''}
        onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
        required
        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        placeholder="e.g. 250655"
      />
    </div>
  </div>

  <div>
    <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      ID Number <span className="text-red-500">*</span>
    </label>
    <input
      id="idNumber"
      type="text"
      value={formData.id_number || ''}
      onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
      required
      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
      placeholder="7801015000080"
    />
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
      Required for FICA compliance and payouts.
    </p>
  </div>
</div>

              </>
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
              {loading ? 'Submitting...' : 'Complete Onboarding'}
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
