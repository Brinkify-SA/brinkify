import { useState } from "react";
import { User } from "lucide-react";
import { AddressForm } from "./OnboardingComponent"; // Named import!
import type { OnboardingFormData } from "@/utils/types/OnboardingFormData";

interface Props {
  formData: OnboardingFormData;
  onFormChange: (data: OnboardingFormData) => void;
}

export default function WorkerForm({ formData, onFormChange }: Props) {
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      onFormChange({
        ...formData,
        skills: [...(formData.skills || []), newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    onFormChange({
      ...formData,
      skills: (formData.skills || []).filter((s) => s !== skill),
    });
  };

  return (
    <div className="space-y-6">
      {/* Address */}
      <AddressForm
        address={formData.address}
        onAddressChange={(address: OnboardingFormData["address"]) =>
          onFormChange({ ...formData, address })
        }
      />

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Professional Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          id="bio"
          value={formData.bio || ""}
          onChange={(e) => onFormChange({ ...formData, bio: e.target.value })}
          rows={3}
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="Describe your experience, certifications, and services..."
        />
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Skills <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData.skills || []).map((skill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
