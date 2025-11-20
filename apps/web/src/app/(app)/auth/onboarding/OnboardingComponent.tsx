'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import { User, Mail, MapPin, Camera, Briefcase, Home, Building, Tag, CreditCard } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const userRole = ['worker', 'customer', 'company'].includes(roleParam || '')
      ? (roleParam as 'worker' | 'customer' | 'company')
      : 'company';

    const userEmail = localStorage.getItem('userEmail') || `user-${Date.now()}@brinkify.local`;
    const userId = localStorage.getItem('userId') || `user-${Math.random().toString(36).substring(7)}`;

    setRole(userRole);
    setFormData((prev: OnboardingFormData) => ({
      ...prev,
      id: userId,
      email: userEmail,
      role: userRole,
    }));
  }, [searchParams]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + (formData.portfolio?.length || 0) > 6) {
      setMessage({ type: 'error', text: 'You can upload up to 6 portfolio images.' });
      return;
    }

    try {
      let processedCount = 0;
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          setMessage({ type: 'error', text: `Image ${file.name} must be less than 5MB.` });
          return;
        }

        // Create data URL for local storage
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setPreviewImages((prev) => [...prev, dataUrl]);
          setFormData((prev) => ({
            ...prev,
            portfolio: [...(prev.portfolio || []), dataUrl],
          }));
          processedCount++;
          if (processedCount === files.length) {
            setMessage({ type: 'success', text: 'Images added successfully!' });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      console.error('Error processing images:', error);
      setMessage({ type: 'error', text: 'Failed to process images.' });
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev: string[]) => prev.filter((_, i) => i !== index));
    setFormData((prev: OnboardingFormData) => ({
      ...prev,
      portfolio: (prev.portfolio || []).filter((_, i) => i !== index),
    }));
    setMessage({ type: 'success', text: 'Image removed successfully!' });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!formData.full_name.trim() || !formData.location.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (role === 'worker') {
      if ((formData.portfolio?.length || 0) < 3) {
        setMessage({ type: 'error', text: 'Please upload at least 3 portfolio images.' });
        return;
      }
      if (!formData.bank_name || !formData.account_number || !formData.id_number) {
        setMessage({ type: 'error', text: 'Banking and ID details are required for workers.' });
        return;
      }
    }

    if (role === 'company' && !formData.company_name?.trim()) {
      setMessage({ type: 'error', text: 'Company Name is required for companies.' });
      return;
    }

    try {
      // Save profile to localStorage
      localStorage.setItem(`profile_${formData.id}`, JSON.stringify(formData));
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userId', formData.id);

      setMessage({ type: 'success', text: 'Onboarding complete! Redirecting to dashboard...' });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setMessage({ type: 'error', text: 'Failed to complete onboarding. Please try again.' });
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">Loading profile setup...</p>
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
