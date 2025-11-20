"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { MapPin, Star, Search, CheckCircle, Users } from "lucide-react";

interface Profile {
  id: string;
  type: "worker" | "company";
  name: string;
  avatar: string;
  verified?: boolean;
  rating?: number;
  reviews?: number;
  category?: string;
  location?: string;
  bio?: string;
}

const MOCK_PROFILES: Profile[] = [
  {
    id: "w-101",
    type: "worker",
    name: "Thabo Mthembu",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Thabo",
    verified: true,
    rating: 4.9,
    reviews: 47,
    category: "Carpentry",
    location: "Pretoria, Gauteng",
    bio: "Expert carpenter specializing in cabinetry and deck construction.",
  },
  {
    id: "w-102",
    type: "worker",
    name: "Naledi Khubone",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Naledi",
    verified: true,
    rating: 4.8,
    reviews: 63,
    category: "Electrical",
    location: "Johannesburg, Gauteng",
    bio: "Certified electrician: rewiring, solar setups, and safe installations.",
  },
  {
    id: "w-103",
    type: "worker",
    name: "Sarah Nkosi",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah",
    verified: false,
    rating: 4.5,
    reviews: 12,
    category: "Tiling",
    location: "Durban, KZN",
    bio: "Tiling specialist for bathrooms and outdoor areas.",
  },
  {
    id: "c-201",
    type: "company",
    name: "BrightHome Contractors",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BrightHome",
    verified: true,
    rating: 4.7,
    reviews: 128,
    category: "General Contracting",
    location: "Cape Town, Western Cape",
    bio: "Full-service home contracting company: renovations, electrical, plumbing.",
  },
  {
    id: "w-104",
    type: "worker",
    name: "Kagiso Molefe",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Kagiso",
    verified: true,
    rating: 4.8,
    reviews: 55,
    category: "Plumbing",
    location: "Pretoria, Gauteng",
    bio: "Emergency and maintenance plumbing services.",
  },
  {
    id: "c-202",
    type: "company",
    name: "EcoSolar Installations",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EcoSolar",
    verified: false,
    rating: 4.6,
    reviews: 34,
    category: "Renewable Energy",
    location: "Stellenbosch, Western Cape",
    bio: "Solar panel and battery system installers for homes and small businesses.",
  },
  {
    id: "w-105",
    type: "worker",
    name: "Lerato Dlamini",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Lerato",
    verified: true,
    rating: 4.9,
    reviews: 71,
    category: "Tiling",
    location: "Durban, KZN",
    bio: "Precision tiler with waterproofing experience.",
  },
  {
    id: "w-106",
    type: "worker",
    name: "Amahle Zwane",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Amahle",
    verified: false,
    rating: 4.7,
    reviews: 44,
    category: "Carpentry",
    location: "Randburg, Gauteng",
    bio: "Decks and outdoor structures specialist.",
  },
];

export default function FeedPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(MOCK_PROFILES.map(p => p.category).filter(Boolean)))], []);

  const filtered = useMemo(() => {
    return MOCK_PROFILES.filter(p => {
      const matchesCategory = category === "All" || p.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery = q === "" || p.name.toLowerCase().includes(q) || (p.bio || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">Brinkify Profiles</h1>
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search workers or companies..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
          </div>
          <select aria-label="Filter by category" value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(p => (
            <Link key={p.id} href={`/profile/${p.id}`} className="group block bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                <img src={p.avatar} alt={p.name} className="w-14 h-14 rounded-full border-2 border-gray-100 dark:border-gray-700" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">{p.name}</h3>
                    <div className="flex items-center gap-2">
                      {p.verified && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />Verified</span>}
                      {p.type === "company" && <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full flex items-center gap-1"><Users className="w-3 h-3" />Company</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-500 text-sm mt-1">
                    <Star className="w-4 h-4" />
                    <span className="font-medium">{p.rating?.toFixed(1) ?? "-"}</span>
                    <span className="text-gray-500 dark:text-gray-400">({p.reviews ?? 0})</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{p.category} • {p.location}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{p.bio}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
