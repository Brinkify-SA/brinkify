// app/pricing/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Crown, Building } from 'lucide-react';

const WORKER_PLANS = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'Perfect for getting started',
    features: [
      'Profile creation & listing in worker directory',
      'Upload up to 3 portfolio images',
      'Access to 5 job leads per month',
      'Receive reviews & ratings from completed jobs',
      'Secure in-app chat with clients',
      'Access to Brinkify’s learning resources (tips, guides, safety advice)'
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'R29/mo',
    description: 'For serious professionals',
    features: [
      '✅ Everything in Basic',
      '10 job leads per month',
      'Upload up to 10 portfolio images',
      'Appear higher in local search results',
      'Access client phone number after acceptance',
      'Apply for Brinkify Certified Badge (after 3 successful jobs)',
      'Job notifications when clients post near your area'
    ],
    cta: 'Try for free',
    popular: true,
  },
  {
    name: 'Elite',
    price: 'R49/mo',
    description: 'Maximize your visibility',
    features: [
      '✅ Everything in Pro',
      '30 job leads per month',
      'Unlimited portfolio uploads (images + videos)',
      'Priority listing in search results (top positions)',
      'Analytics dashboard (profile views, ratings, conversion rate)',
      'Option to display verified qualifications on profile',
      'Direct client message requests before applying to jobs'
    ],
    cta: 'Try for free',
    popular: false,
  },
];

const COMPANY_PLANS = [
  {
    name: 'Starter',
    price: 'R299/mo',
    description: 'Small business / contractor',
    features: [
      'Company profile with logo and business verification badge',
      'Upload up to 25 project photos or videos',
      'Access to 20 job leads per month',
      'Team management tools for up to 3 workers',
      'Client ratings & reviews dashboard',
      'Priority listing in local searches',
      'Business analytics: profile visits, lead conversions, client feedback',
      'Secure chat & quote management with clients'
    ],
    cta: 'Try for free',
    popular: false,
  },
  {
    name: 'Business',
    price: 'R499/mo',
    description: 'Mid-size company or facility managers',
    features: [
      '✅ Everything in Starter',
      'Featured listing in top results of your category and region',
      'Access to unlimited job leads per month',
      'Add up to 10 workers/team members',
      'Brinkify Business Badge (indicating verified, professional status)',
      'Dedicated client support line for quicker dispute resolution',
      'Company analytics dashboard',
      'Portfolio Highlight Section: large projects, before/after comparisons',
      'Brinkify promotions: newsletters or social media showcase'
    ],
    cta: 'Try for free',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'R899/mo',
    description: 'Developers or agencies',
    features: [
      '✅ Everything in Business',
      'Top Featured Listing across provinces',
      'Unlimited job leads & quote requests',
      'Add up to 25 workers/team members under your account',
      'Dedicated account manager for personalized support',
      'Brinkify Elite Partner Badge — trusted large-scale contractor status',
      'Branded profile page (custom banner, logo, business details)',
      'Monthly marketing boost: promoted on Brinkify social media & homepage',
      'Early access to corporate/government job tenders',
      'Advanced analytics suite: client demographics, top workers, growth reports'
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'workers' | 'companies'>('workers');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="py-16 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Unlock real opportunities with Brinkify SA. Start free, upgrade anytime.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-6 py-2 rounded-md text-sm font-medium ${
              activeTab === 'workers'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <UserIcon className="w-4 h-4 inline mr-2" />
            For Workers
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-6 py-2 rounded-md text-sm font-medium ${
              activeTab === 'companies'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <Building className="w-4 h-4 inline mr-2" />
            For Companies
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'workers' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {WORKER_PLANS.map((plan, i) => (
                <PlanCard key={i} plan={plan} type="worker" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {COMPANY_PLANS.map((plan, i) => (
                <PlanCard key={i} plan={plan} type="company" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold">Can I change my plan later?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! Upgrade, downgrade, or cancel anytime. Changes apply at the end of your billing cycle.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold">What happens after my free trial?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You’ll be charged automatically unless you cancel. No hidden fees. Cancel anytime.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold">Do you offer refunds?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We offer a 14-day money-back guarantee for all paid plans.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Reusable Plan Card
function PlanCard({ plan, type }: { plan: any; type: 'worker' | 'company' }) {
  const Icon = plan.popular ? Crown : CheckCircle;
  const isEnterprise = plan.name === 'Enterprise';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border ${
        plan.popular ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {plan.popular && (
        <div className="bg-blue-500 text-white text-center py-2 rounded-t-2xl font-bold">
          MOST POPULAR
        </div>
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{plan.name}</h2>
        <div className="mt-2">
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{plan.price}</span>
          {plan.price !== 'Free' && <span className="text-gray-500">/month</span>}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>

        <ul className="mt-6 space-y-3 max-h-80 overflow-y-auto pr-2">
          {plan.features.map((feature: string, j: number) => (
            <li key={j} className="flex items-start">
              <Icon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => {
            if (isEnterprise) {
              window.location.href = 'mailto:support@brinkifysa.co.za?subject=Enterprise Plan Inquiry';
            } else {
              window.location.href = '/auth/signup?role=' + (type === 'worker' ? 'worker' : 'company') + '&plan=' + plan.name;
            }
          }}
          className={`w-full mt-6 py-3 rounded-lg font-semibold ${
            plan.popular
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : isEnterprise
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
          }`}
        >
          {plan.cta}
        </button>
      </div>
    </div>
  );
}

// Simple User Icon
function UserIcon(props: any) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );
}
