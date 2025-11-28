export type OnboardingFormData = {
  id: string;
  email: string;
  role: "worker" | "customer" | "company";
  avatar_url: string;
  address: {
    country: string;
    province: string;
    city: string;
    street_number: string;
    street_name: string;
    postal_code: string;
  };
  skills?: string[];
  bio?: string;
  company_name?: string;
  tax_number?: string;
};
