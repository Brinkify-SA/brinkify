import { User } from "lucide-react";
import { AddressForm } from "./OnboardingComponent"; // Named import!
import type { OnboardingFormData } from "@/utils/types/OnboardingFormData";

interface Props {
  formData: OnboardingFormData;
  onFormChange: (data: OnboardingFormData) => void;
}

export default function CustomerForm({ formData, onFormChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Full Name */}

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
