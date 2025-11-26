"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Camera, User, MapPin, Home, Building, Tag } from "lucide-react";
import WorkerForm from "./WorkerForm";
import CustomerForm from "./CustomerForm";
import CompanyForm from "./CompanyForm";
import { getUserFromCookies } from "@/utils/base64Utils";

// Types (exported for forms to import)
export interface Address {
  country: string;
  province: string;
  city: string;
  street_number: string;
  street_name: string;
  postal_code: string;
}

export interface BaseUser {
  id: string;
  email: string;
  role: "worker" | "customer" | "company";
  avatar_url: string;
  address: Address;
  company_name?: string;
  tax_number?: string;
  skills?: string[];
  bio?: string;
}

export interface WorkerUser extends BaseUser {
  role: "worker";
  skills: string[];
  bio: string;
}

export interface CustomerUser extends BaseUser {
  role: "customer";
}

export interface CompanyUser extends BaseUser {
  role: "company";
  company_name: string;
  tax_number: string;
}

export type OnboardingUser = WorkerUser | CustomerUser | CompanyUser;

export interface Message {
  type: "success" | "error";
  text: string;
}

// Custom Hook (exported if needed elsewhere)
export function useOnboardingSubmit(formData: OnboardingUser, router: any) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Common validation: address completeness
    const isAddressComplete = Object.values(formData.address).every((val) =>
      val.trim()
    );
    if (!isAddressComplete) {
      setMessage({ type: "error", text: "Please fill in all address fields." });
      return;
    }

    // Role-specific validation
    if (formData.role === "worker") {
      if (!formData.bio.trim() || formData.skills.length === 0) {
        setMessage({
          type: "error",
          text: "Bio and at least one skill are required for workers.",
        });
        return;
      }
    } else if (formData.role === "company") {
      if (!formData.company_name.trim() || !formData.tax_number.trim()) {
        setMessage({
          type: "error",
          text: "Company name and tax number are required.",
        });
        return;
      }
    }

    setLoading(true);
    try {
      localStorage.setItem(`profile_${formData.id}`, JSON.stringify(formData));
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userId", formData.id);
      setMessage({
        type: "success",
        text: "Onboarding complete! Redirecting to dashboard...",
      });
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      console.error("Error completing onboarding:", err);
      setMessage({
        type: "error",
        text: "Failed to complete onboarding. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, message, validateAndSubmit };
}

// Shared: AvatarUpload Component

// Shared: AddressForm Component (NOW EXPORTED!)
export function AddressForm({
  address,
  onAddressChange,
}: {
  address: Address;
  onAddressChange: (address: Address) => void;
}) {
  const updateField = (field: keyof Address, value: string) => {
    onAddressChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Address <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={address.street_number}
            onChange={(e) => updateField("street_number", e.target.value)}
            placeholder="Street Number"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
          />
        </div>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={address.street_name}
            onChange={(e) => updateField("street_name", e.target.value)}
            placeholder="Street Name"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={address.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="City"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={address.province}
            onChange={(e) => updateField("province", e.target.value)}
            placeholder="Province"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
          />
        </div>
        <div className="relative md:col-span-2">
          <input
            type="text"
            value={address.postal_code}
            onChange={(e) => updateField("postal_code", e.target.value)}
            placeholder="Postal Code"
            className="w-full pl-4 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
          />
        </div>
        <div className="relative md:col-span-2">
          <input
            type="text"
            value={address.country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="Country"
            className="w-full pl-4 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
          />
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        This helps us recommend local opportunities.
      </p>
    </div>
  );
}

export default function OnboardingComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"worker" | "customer" | "company" | null>(
    null
  );
  const [formData, setFormData] = useState<OnboardingUser>({
    id: "",
    email: "",
    role: "worker" as const,
    avatar_url: "",
    address: {
      country: "South Africa",
      province: "",
      city: "",
      street_number: "",
      street_name: "",
      postal_code: "",
    },
    skills: [],
    bio: "",
    company_name: "",
    tax_number: "",
  });

  useEffect(() => {
    //get stored data from cookies.
    const appUser = getUserFromCookies();
    const roleParam = appUser?.role;

    const userRole = (
      ["worker", "customer", "company"].includes(roleParam || "")
        ? (roleParam as "worker" | "customer" | "company")
        : "company"
    ) as "worker" | "customer" | "company";
    const userEmail =
      localStorage.getItem("userEmail") || `user-${Date.now()}@brinkify.local`;
    const userId =
      localStorage.getItem("userId") ||
      `user-${Math.random().toString(36).substring(7)}`;

    setRole(userRole);

    const base = {
      id: userId,
      full_name: "",
      email: userEmail,
      role: userRole,
      avatar_url: "",
      address: {
        country: "South Africa",
        province: "",
        city: "",
        street_number: "",
        street_name: "",
        postal_code: "",
      },
    };

    let initializedData: OnboardingUser;
    if (userRole === "worker") {
      initializedData = { ...base, skills: [], bio: "" } as OnboardingUser;
    } else if (userRole === "customer") {
      initializedData = base as OnboardingUser;
    } else {
      initializedData = {
        ...base,
        company_name: "",
        tax_number: "",
      } as OnboardingUser;
    }

    setFormData(initializedData);
  }, [searchParams]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleAvatarChange = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }));
  };

  const { loading, message, validateAndSubmit } = useOnboardingSubmit(
    formData,
    router
  );

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400">
          Loading profile setup...
        </p>
      </div>
    );
  }

  const renderRoleForm = () => {
    switch (role) {
      case "worker":
        return <WorkerForm formData={formData} onFormChange={setFormData} />;
      case "customer":
        return <CustomerForm formData={formData} onFormChange={setFormData} />;
      case "company":
        return <CompanyForm formData={formData} onFormChange={setFormData} />;
      default:
        return null;
    }
  };

  const isWorker = role === "worker";
  const isCompany = role === "company";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => router.push("/auth/signup")}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            {isWorker
              ? "Worker Onboarding"
              : isCompany
              ? "Company Onboarding"
              : "Customer Onboarding"}
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
                ? "Complete Your Worker Profile"
                : isCompany
                ? "Complete Your Company Profile"
                : "Complete Your Profile"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isWorker
                ? "Showcase your skills and get verified to start receiving jobs."
                : isCompany
                ? "Tell us about your business and hiring needs."
                : "Help us match you with the right professionals."}
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={validateAndSubmit} className="space-y-6">
            {renderRoleForm()}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? "Submitting..." : "Complete Onboarding"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-6 text-center">
        <div className="container mx-auto px-4">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            Brinkify SA
          </span>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            © {new Date().getFullYear()} Connecting skilled workers with
            homeowners across South Africa.
          </p>
        </div>
      </footer>
    </div>
  );
}
