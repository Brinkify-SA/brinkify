'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Crown } from 'lucide-react';

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

export default function SubscriptionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();

  const handlePlanSelection = (planName: string) => {
    router.push(`/auth/signup?role=worker&plan=${planName}`);
  };

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
                    Upgrade Your Plan
                  </h2>
                  <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                    You are currently on the Basic (Free) plan. Upgrade to unlock more features.
                  </p>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {WORKER_PLANS.map((plan) => (
                      <div
                        key={plan.name}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600"
                      >
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{plan.name}</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{plan.price}</p>
                        <ul className="mt-6 space-y-3">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handlePlanSelection(plan.name)}
                          className="w-full mt-8 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {plan.cta}
                        </button>
                      </div>
                    ))}
                  </div>

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
