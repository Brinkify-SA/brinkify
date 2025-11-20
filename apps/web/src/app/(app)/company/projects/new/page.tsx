"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProject = {
      id: `proj_${Date.now()}`,
      title,
      clientName,
      clientLocation,
      startDate,
      endDate,
      teamSize: Number(teamSize),
      budget,
      status,
      rating: null,
    };

    try {
      const existing = JSON.parse(localStorage.getItem('projects') || '[]');
      existing.unshift(newProject);
      localStorage.setItem('projects', JSON.stringify(existing));
    } catch (err) {
      localStorage.setItem('projects', JSON.stringify([newProject]));
    }

    router.push('/company/projects');
  };

  return (
    <div className="min-h-screen container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="proj-title" className="block text-sm font-medium mb-1">Project Title</label>
            <input id="proj-title" title="Project Title" placeholder="e.g. Office Renovation" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
          </div>

          <div>
            <label htmlFor="client-name" className="block text-sm font-medium mb-1">Client Name</label>
            <input id="client-name" title="Client Name" placeholder="e.g. TechStart Ltd" required value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
          </div>

          <div>
            <label htmlFor="client-location" className="block text-sm font-medium mb-1">Client Location</label>
            <input id="client-location" title="Client Location" placeholder="e.g. Johannesburg, Sandton" value={clientLocation} onChange={(e) => setClientLocation(e.target.value)} className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium mb-1">Start Date</label>
              <input id="start-date" title="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium mb-1">End Date</label>
              <input id="end-date" title="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="team-size" className="block text-sm font-medium mb-1">Team Size</label>
              <input id="team-size" title="Team Size" type="number" min={1} value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium mb-1">Budget</label>
              <input id="budget" title="Budget" placeholder="e.g. R 85,000" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select id="status" title="Project Status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => router.push('/company/projects')} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white flex items-center gap-2"><Plus className="w-4 h-4" /> Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
