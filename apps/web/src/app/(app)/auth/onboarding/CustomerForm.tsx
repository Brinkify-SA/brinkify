import { User } from "lucide-react";
import {
  AddressForm,
  type OnboardingUser,
  type Address,
} from "./OnboardingComponent"; // Named import!

interface Props {
  formData: OnboardingUser;
  onFormChange: (data: OnboardingUser) => void;
}

export default function CustomerForm({ formData, onFormChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="fullName"
            type="text"
            value={formData.full_name}
            onChange={(e) =>
              onFormChange({ ...formData, full_name: e.target.value })
            }
            required
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="e.g. Jane Smith"
          />
        </div>
      </div>

      {/* Address */}
      <AddressForm
        address={formData.address}
        onAddressChange={(address: Address) =>
          onFormChange({ ...formData, address })
        }
      />
    </div>
  );
}
