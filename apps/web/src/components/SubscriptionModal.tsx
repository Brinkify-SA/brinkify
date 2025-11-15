'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase/api';
import { toast } from 'sonner';

const WORKER_PLANS = [
  {
    name: 'Pro',
    price: 'R29/mo',
    features: [
      '10 job leads per month',
      'Upload up to 10 portfolio images',
      'Appear higher in local search results',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Elite',
    price: 'R49/mo',
    features: [
      '30 job leads per month',
      'Unlimited portfolio uploads',
      'Priority listing in search results',
    ],
    cta: 'Upgrade to Elite',
  },
];

const COMPANY_PLANS = [
  {
    name: 'Starter',
    price: 'R299/mo',
    features: [
      'Company profile with logo and business verification badge',
      'Upload up to 25 project photos or videos',
      'Access to 20 job leads per month',
    ],
    cta: 'Upgrade to Starter',
  },
  {
    name: 'Business',
    price: 'R499/mo',
    features: [
      'Everything in Starter',
      'Featured listing in top results of your category and region',
      'Access to unlimited job leads per month',
    ],
    cta: 'Upgrade to Business',
  },
  {
    name: 'Enterprise',
    price: 'R899/mo',
    features: [
      'Everything in Business',
      'Top Featured Listing across provinces',
      'Unlimited job leads & quote requests',
    ],
    cta: 'Upgrade to Enterprise',
  },
];

export default function SubscriptionModal({
  isOpen,
  onClose,
  selectedPlan,
  selectedPlanType,
  currentUserPlan,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: any;
  selectedPlanType: 'worker' | 'company' | null;
  currentUserPlan: string | null;
  userId: string | undefined;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePlanUpdate = async () => {
    if (!userId || !selectedPlan || !selectedPlanType) {
      toast.error('Missing user or plan information.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('profiles') // Assuming 'profiles' table stores user plan
      .update({ plan_name: selectedPlan.name, role: selectedPlanType })
      .eq('id', userId);

    setLoading(false);

    if (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update your plan. Please try again.');
    } else {
      toast.success(`Your plan has been updated to ${selectedPlan.name}!`);
      onClose();
      router.refresh(); // Refresh the page to show updated plan
    }
  };

  const plansToDisplay = selectedPlanType === 'worker' ? WORKER_PLANS : COMPANY_PLANS;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
                    {selectedPlan ? `Change to ${selectedPlan.name} Plan` : 'Upgrade Your Plan'}
                  </h2>
                  <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                    {currentUserPlan
                      ? `You are currently on the ${currentUserPlan} plan.`
                      : 'You are currently on the Basic (Free) plan.'}
                    Upgrade to unlock more features.
                  </p>

                  {selectedPlan && (
                    <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedPlan.name}</h3>
                      <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{selectedPlan.price}</p>
                      <ul className="mt-6 space-y-3">
                        {selectedPlan.features.map((feature: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={handlePlanUpdate}
                        disabled={loading}
                        className="w-full mt-8 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Updating...' : `Confirm Upgrade to ${selectedPlan.name}`}
                      </button>
                    </div>
                  )}

                  <div className="mt-8 text-center">
                    <button
                      onClick={onClose}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
