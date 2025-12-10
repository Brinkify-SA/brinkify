"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Heart,
  MessageCircle,
  Bookmark,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";


interface FeedPost {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price: string;
  createdAt: string;
  verified: boolean;
  images: string[]; 
  likes: number;
  comments: number;
  saves: number;
  views: number;
  tags: string[];
  customer: {
    id: string;
    name: string;
  };
}

export default function FeedPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  const CATEGORIES = ["All", "Carpentry", "Plumbing", "Electrical", "Tiling", "Cleaning", "Handyman"];


  useEffect(() => {
    setLoading(true);
    fetch("/api/feed")
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setPosts(arr);
      })
      .catch((err) => {
        console.error("Error fetching feed:", err);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  //Filter and search feature
  const filteredPosts = posts.filter((p) => {
    const catMatch = selectedCategory === "All" || p.category === selectedCategory;
    const text = (search || "").toLowerCase();
    const searchMatch =
      p.title?.toLowerCase().includes(text) ||
      p.description?.toLowerCase().includes(text) ||
      p.customer?.name?.toLowerCase().includes(text);
    return catMatch && searchMatch;
  });

  // Image gallery helpers
  const nextImage = (postId: string, count: number) =>
    setCurrentImageIndex((s) => ({ ...s, [postId]: ((s[postId] || 0) + 1) % count }));
  const prevImage = (postId: string, count: number) =>
    setCurrentImageIndex((s) => ({ ...s, [postId]: ((s[postId] || 0) - 1 + count) % count }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header / Search */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <h1 className="text-xl font-bold">Brinkify Feed</h1>

          <div className="flex-1 flex items-center gap-2">
            <Search className="text-gray-400" />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Search jobs, customers, descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Filter className="text-gray-400" />
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === c ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main feed */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-24 text-gray-500">Loading feed…</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24 text-gray-500">No posts found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const imgCount = post.images?.length || 0;
              const idx = currentImageIndex[post.id] || 0;
              const imageSrc = imgCount > 0 ? post.images[idx] : `/default-job.png`;

              return (
                <article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700"
                >
                  {/* Image area */}
                  <div className="relative h-56 bg-gray-200 dark:bg-gray-700">
                    {/* main image */}
                    <img
                      src={imageSrc}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `/default-job.png`;
                      }}
                    />

                    {/* left / right nav if multiple images */}
                    {imgCount > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(post.id, imgCount)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
                          aria-label="previous image"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => nextImage(post.id, imgCount)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
                          aria-label="next image"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* customer badge */}
                    <div className="absolute left-3 top-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-2">
                      <img
                        alt={post.customer?.name}
                        className="w-5 h-5 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            post.customer?.name ?? "User"
                          )}`;
                        }}
                      />
                      <span>{post.customer?.name}</span>
                    </div>

                    {/* category tag */}
                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                      {post.category}
                    </div>

                    {/* image counter */}
                    {imgCount > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                        {idx + 1}/{imgCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{post.description}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {post.location}
                        </div>
                        <div className="text-sm font-semibold">{post.price}</div>
                      </div>

                      <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>

                    {/* Footer actions */}
                    <div className="mt-3 flex items-center gap-3">
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700">
                        <Heart className="w-4 h-4" /> {post.likes}
                      </button>

                      <button
                        onClick={() => router.push(`/jobs/${post.id}`)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-600 text-white"
                      >
                        <MessageCircle className="w-4 h-4" /> Contact
                      </button>

                      <button className="ml-auto text-gray-500">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
