import { Building, Tag } from "lucide-react";
import { AddressForm } from "./OnboardingComponent"; // Named import!
import type { OnboardingFormData } from "@/utils/types/OnboardingFormData";

interface Props {
  formData: OnboardingFormData;
  onFormChange: (data: OnboardingFormData) => void;
}

export default function CompanyForm({ formData, onFormChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Company Name */}
      <div>
        <label
          htmlFor="companyName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Company Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="companyName"
            type="text"
            value={formData.company_name || ""}
            onChange={(e) =>
              onFormChange({ ...formData, company_name: e.target.value })
            }
            required
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="e.g. ABC Construction"
          />
        </div>
      </div>

      {/* Tax Number */}
      <div>
        <label
          htmlFor="taxNumber"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Tax Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="taxNumber"
            type="text"
            value={formData.tax_number || ""}
            onChange={(e) =>
              onFormChange({ ...formData, tax_number: e.target.value })
            }
            required
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="e.g. 1234567890"
          />
        </div>
      </div>

      {/* Address */}
      <AddressForm
        address={formData.address}
        onAddressChange={(address: OnboardingFormData["address"]) =>
          onFormChange({ ...formData, address })
        }
      />
    </div>
  );
}
