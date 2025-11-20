'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check, ChevronLeft } from 'lucide-react';

interface AvailableWorker {
  id: string;
  name: string;
  role: string;
  avatar: string;
  location: string;
  rating: number;
  reviews: number;
}

const AVAILABLE_WORKERS: AvailableWorker[] = [
  {
    id: 'w4',
    name: 'Sipho Dlamini',
    role: 'Plumber',
    avatar: 'https://ui-avatars.com/api/?name=Sipho+Dlamini&background=EC4899&color=fff',
    location: 'Durban, Pinetown',
    rating: 4.9,
    reviews: 28,
  },
  {
    id: 'w5',
    name: 'Amahle Mthembu',
    role: 'Electrician',
    avatar: 'https://ui-avatars.com/api/?name=Amahle+Mthembu&background=06B6D4&color=fff',
    location: 'Johannesburg, Randburg',
    rating: 4.8,
    reviews: 35,
  },
  {
    id: 'w6',
    name: 'Themba Nkosi',
    role: 'Carpenter',
    avatar: 'https://ui-avatars.com/api/?name=Themba+Nkosi&background=F59E0B&color=fff',
    location: 'Pretoria, Centurion',
    rating: 4.7,
    reviews: 19,
  },
  {
    id: 'w7',
    name: 'Naledi Khubone',
    role: 'Painter',
    avatar: 'https://ui-avatars.com/api/?name=Naledi+Khubone&background=8B5CF6&color=fff',
    location: 'Cape Town, Bellville',
    rating: 4.6,
    reviews: 22,
  },
  {
    id: 'w8',
    name: 'Kagiso Molefe',
    role: 'Gardener',
    avatar: 'https://ui-avatars.com/api/?name=Kagiso+Molefe&background=10B981&color=fff',
    location: 'Johannesburg, Sandton',
    rating: 4.9,
    reviews: 41,
  },
];

export default function InviteWorkersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return AVAILABLE_WORKERS.filter(w =>
      q === '' || w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleInvite = () => {
    // In a real app, this would save the invitations to DB/localStorage
    // For now, just navigate back
    router.push('/company/team');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.push('/company/team')} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-xl font-bold">Invite Workers</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-3 mb-6">
          {filtered.map((worker) => (
            <div
              key={worker.id}
              onClick={() => toggleSelect(worker.id)}
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg border-2 cursor-pointer transition ${
                selected.has(worker.id)
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selected.has(worker.id)}
                    onChange={() => {}}
                    aria-label={`Select ${worker.name}`}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>
                <img src={worker.avatar} alt={worker.name} className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{worker.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{worker.role} • {worker.location}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">⭐ {worker.rating} ({worker.reviews} reviews)</p>
                </div>
                {selected.has(worker.id) && (
                  <div className="flex-shrink-0">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/company/team')}
            className="flex-1 px-4 py-2.5 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={selected.size === 0}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Invite {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </main>
    </div>
  );
}
