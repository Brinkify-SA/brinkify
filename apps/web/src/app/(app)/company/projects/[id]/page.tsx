"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, User, Briefcase, Clock, Star } from 'lucide-react';

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

export default function ProjectDetailsPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const [project, setProject] = useState<any | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;

    try {
      const stored = JSON.parse(localStorage.getItem('projects') || '[]');
      const found = stored.find((p: any) => p.id === id);
      if (found) {
        setProject(found);
        return;
      }
    } catch (err) {
      // ignore
    }

    const fromMock = MOCK_PROJECTS.find((p) => p.id === id) || null;
    setProject(fromMock);
  }, [params]);

  if (!project) {
    return (
      <div className="min-h-screen container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="mb-4">Project not found.</p>
          <button onClick={() => router.push('/company/projects')} className="px-4 py-2 rounded bg-blue-600 text-white">Back to Projects</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">For {project.clientName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Status</p>
            <p className="font-medium">{project.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {project.clientLocation}</div>
          <div className="flex items-center gap-2"><User className="w-4 h-4" /> {project.teamSize} workers</div>
          <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {project.budget}</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {project.startDate} → {project.endDate}</div>
        </div>

        {project.rating && (
          <div className="mt-4 flex items-center gap-2 text-yellow-500">
            <Star className="w-4 h-4" /> <span className="font-medium">{project.rating}</span>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button onClick={() => router.push('/company/projects')} className="px-4 py-2 rounded border">Back</button>
          <button className="px-4 py-2 rounded bg-green-600 text-white">Mark Complete</button>
        </div>
      </div>
    </div>
  );
}
