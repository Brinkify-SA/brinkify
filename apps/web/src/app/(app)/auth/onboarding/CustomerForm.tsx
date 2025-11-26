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
