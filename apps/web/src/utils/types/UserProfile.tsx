export interface UserProfile {
  id: string;
  full_name: string; // Merged first and last names
  role: "worker" | "customer" | "company";
  avatar_url: string;
  location: string;
  is_verified: boolean;
  team_size?: number;
  job_leads_used?: number;
  leads_limit?: number;
  total_earnings?: number;
  average_rating?: number;
  total_spent?: number;
  saved_pros_count?: number;
  active_projects?: number;

  // New fields from JSON
  email: string;
  created_at: string;

  // Worker-specific fields (nested structure)
  workers?: Worker;
  companies?: Company | null;
  customers?: Customer | null;

  // Subscription and trial data
  subscriptions?: any; // You can specify this further if needed
  trials: any[]; // Assuming trials is an array

  // Address data (array)
  addresses: Address[];
  plan: {
    name: string;
    price: number;
  }
}

interface Worker {
  id: string;
  bio: string;
  skills: string;
  user_id: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  // Add any additional company-specific fields here
}

interface Customer {
  id: string;
  name: string;
  // Add any customer-specific fields here
}

interface Address {
  id: number;
  city: string;
  country: string;
  user_id: string;
  province: string;
  company_id: string | null;
  created_at: string;
  postal_code: string;
  street_name: string | null;
  street_number: string;
}
