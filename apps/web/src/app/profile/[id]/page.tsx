'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ModeToggle } from '@/components/mode-toggle';
import {
  MapPin,
  Star,
  MessageCircle,
  ArrowLeft,
  Link as LinkIcon,
} from 'lucide-react';

// Mock worker data
const MOCK_WORKER = {
  id: 'user_123',
  name: 'Kamo Nkosi',
  avatar:
    'https://ui-avatars.com/api/?name=Thabo+Nkosi&background=4F46E5&color=fff',
  location: 'Johannesburg, Sandton',
  role: 'worker',
  bio: 'Certified electrician with 5+ years of experience in residential and commercial projects. Committed to quality and safety.',
  skills: ['Electrical', 'Lighting', 'Wiring', 'Solar Installation'],
  hourlyRate: '450',
  rating: 4.9,
  reviews: 82,
  portfolio: [
    { title: 'Kitchen Renovation', url: 'https://example.com/project-1' },
    { title: 'Office Lighting Setup', url: 'https://example.com/project-2' },
    { title: 'Solar Panel Installation', url: 'https://example.com/project-3' },
  ],
};

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams(); // ✅ correct for client components
  const [worker, setWorker] = useState<typeof MOCK_WORKER | null>(null);

  useEffect(() => {
    // In a real app, you'd fetch worker data based on params.id
    if (params?.id) {
      setWorker(MOCK_WORKER);
    }
  }, [params?.id]);

  const handleBack = () => router.back();
  const handleContact = () => router.push('/messages');

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white md:hidden">
            Worker Profile
          </h1>
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-24 h-24 rounded-full border-4 border-blue-200 dark:border-blue-800"
              />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold">{worker.name}</h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-400 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{worker.location}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">{worker.rating}</span>
                  <span className="text-gray-500">
                    ({worker.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center sm:justify-end">
              <button
                onClick={handleContact}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contact
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-3">About</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {worker.bio}
            </p>
          </div>

          {/* Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-400">
                  Hourly Rate
                </h3>
                <p className="font-bold text-lg">R {worker.hourlyRate}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-400">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {worker.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Portfolio</h2>
            <div className="space-y-4">
              {worker.portfolio.length > 0 ? (
                worker.portfolio.map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <LinkIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {item.title}
                    </span>
                  </a>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No portfolio items yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
