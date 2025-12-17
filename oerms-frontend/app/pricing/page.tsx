import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Pricing | OERMS',
    description: 'Flexible pricing plans for every institution. Choose the plan that fits your needs - Starter, Standard, or Enterprise.',
};

export default function PricingPage() {
    const plans = [
        {
            name: 'Starter',
            price: 'Free',
            period: 'forever',
            description: 'Ideal for small coaching centers getting started',
            color: 'blue',
            features: [
                'Up to 100 students',
                'Student management',
                'Basic exam creation',
                'Result publishing',
                'Email notifications',
                'Basic support',
            ],
            cta: 'Get Started Free',
            href: '/register',
            popular: false,
        },
        {
            name: 'Standard',
            price: 'Contact Us',
            period: 'per month',
            description: 'Perfect for mid-sized schools and coaching centers',
            color: 'purple',
            features: [
                'Everything in Starter',
                'Unlimited students',
                'Unlimited exams',
                'OMR sheet generation',
                'Bulk upload/download',
                'Parent portal',
                'Attendance module',
                'Fee management',
                'WhatsApp notifications',
                'Priority support',
            ],
            cta: 'Contact Sales',
            href: '/contact',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: 'pricing',
            description: 'For universities and large institutions',
            color: 'indigo',
            features: [
                'Everything in Standard',
                'Multi-branch support',
                'Custom workflows',
                'Dedicated server',
                'API access',
                'Custom integrations',
                'Advanced analytics',
                'SLA guarantee',
                'Dedicated account manager',
                '24/7 priority support',
            ],
            cta: 'Contact Sales',
            href: '/contact',
            popular: false,
        },
    ];

    const faqs = [
        {
            question: 'Can I upgrade or downgrade my plan?',
            answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
        },
        {
            question: 'Is there a free trial?',
            answer: 'Yes! Our Starter plan is completely free and includes core features. You can upgrade anytime as your needs grow.',
        },
        {
            question: 'Do you offer discounts for educational institutions?',
            answer: 'Yes, we offer special pricing for government schools and non-profit educational institutions. Contact us for details.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major payment methods including bank transfer, credit cards, and mobile payments for Pakistani institutions.',
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-900">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 py-20" aria-label="Pricing overview">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Flexible Plans for Every Institution
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Choose the plan that fits your institution's needs. Start free and scale as you grow.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20" aria-label="Pricing plans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative p-8 rounded-2xl border-2 ${plan.popular
                                    ? 'border-purple-500 bg-white dark:bg-gray-800'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{plan.description}</p>
                                    <div className="flex items-baseline justify-center gap-1" aria-label={`${plan.name} plan price ${plan.price}${plan.period ? ` per ${plan.period}` : ''}`}>
                                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                                        {plan.period && (
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">/{plan.period}</span>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-3">
                                            <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.href}
                                    className={`block w-full py-3 px-6 text-center font-semibold rounded-xl transition-colors focus-ring ${plan.popular
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800/50" aria-label="Plan comparison">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        Compare Plans
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-4 pr-4 text-gray-600 dark:text-gray-400 font-medium">Feature</th>
                                    <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">Starter</th>
                                    <th className="text-center py-4 px-4 text-purple-600 dark:text-purple-400 font-semibold">Standard</th>
                                    <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Students', starter: '100', standard: 'Unlimited', enterprise: 'Unlimited' },
                                    { feature: 'Exams', starter: 'Limited', standard: 'Unlimited', enterprise: 'Unlimited' },
                                    { feature: 'OMR Sheets', starter: '❌', standard: '✅', enterprise: '✅' },
                                    { feature: 'Parent Portal', starter: '❌', standard: '✅', enterprise: '✅' },
                                    { feature: 'WhatsApp Notifications', starter: '❌', standard: '✅', enterprise: '✅' },
                                    { feature: 'Multi-branch', starter: '❌', standard: '❌', enterprise: '✅' },
                                    { feature: 'API Access', starter: '❌', standard: '❌', enterprise: '✅' },
                                    { feature: 'Dedicated Support', starter: '❌', standard: '❌', enterprise: '✅' },
                                ].map((row, index) => (
                                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                                        <td className="py-4 pr-4 text-gray-600 dark:text-gray-400">{row.feature}</td>
                                        <td className="py-4 px-4 text-center text-gray-900 dark:text-white">{row.starter}</td>
                                        <td className="py-4 px-4 text-center text-gray-900 dark:text-white">{row.standard}</td>
                                        <td className="py-4 px-4 text-center text-gray-900 dark:text-white">{row.enterprise}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20" aria-label="Pricing FAQ">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800/50" aria-label="Sales contact">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Need a Custom Solution?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                        Contact us for custom pricing tailored to your institution's specific requirements.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Contact Sales
                    </Link>
                </div>
            </section>
        </div>
    );
}
