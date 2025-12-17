import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Features | OERMS',
    description: 'Explore all features of OERMS - Complete OMR Examination Suite, Student Management, Teacher Tools, Admin Console, and more.',
};

export default function FeaturesPage() {
    const featureCategories = [
        {
            title: 'Complete OMR Examination Suite',
            icon: '📄',
            color: 'blue',
            features: [
                'Create exams with multiple question types',
                'Auto-generate OMR sheets with student details',
                'Student-coded sheets for accuracy',
                'Upload and scan completed sheets',
                'Automated marking & result generation',
                'Instant score calculation',
            ],
        },
        {
            title: 'Student Management',
            icon: '👨‍🎓',
            color: 'green',
            features: [
                'Student admission and enrollment',
                'Profile & photo management',
                'Class/section mapping',
                'Attendance tracking',
                'Fee records and payments',
                'Academic history',
            ],
        },
        {
            title: 'Parent & Student Portal',
            icon: '👨‍👩‍👧',
            color: 'purple',
            features: [
                'View marks and results online',
                'Track attendance records',
                'Download admit cards',
                'Download result PDFs',
                'Receive instant notifications',
                'Fee payment reminders',
            ],
        },
        {
            title: 'Teacher Tools',
            icon: '👨‍🏫',
            color: 'orange',
            features: [
                'Manage exams and question banks',
                'Upload questions in bulk',
                'Generate class reports',
                'Maintain mark registers',
                'View performance analytics',
                'Track student progress',
            ],
        },
        {
            title: 'Admin Console',
            icon: '⚙️',
            color: 'red',
            features: [
                'Add/manage institutes and branches',
                'User creation and management',
                'Role-based permissions',
                'System logs and audit trails',
                'Result publishing controls',
                'SMS/WhatsApp template management',
            ],
        },
        {
            title: 'Notifications Engine',
            icon: '📲',
            color: 'indigo',
            features: [
                'WhatsApp result notifications',
                'Email alerts for important updates',
                'SMS integration',
                'Fee reminders',
                'Exam schedule notifications',
                'Custom notification templates',
            ],
        },
    ];

    const highlights = [
        { value: 'Real-Time', label: 'Result Processing' },
        { value: '99.9%', label: 'Accuracy Rate' },
        { value: 'Bulk', label: 'Upload & Download' },
        { value: '24/7', label: 'Cloud Access' },
    ];

    return (
        <div className="bg-white dark:bg-gray-900">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 py-20" aria-label="Features overview">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Powerful Features
                    </h1>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto">
                        Everything your institute needs to manage examinations efficiently—all in one platform.
                    </p>
                </div>
            </section>

            {/* Highlights */}
            <section className="py-12 bg-gray-50 dark:bg-gray-800/50" aria-label="Highlights">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {highlights.map((item, index) => (
                            <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 card-hover focus-ring" tabIndex={0}>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{item.value}</div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Categories */}
            <section className="py-20" aria-label="Feature categories">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
                            Complete Solution
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            Everything Your Institute Needs
                        </h2>
                    </div>

                    <div className="space-y-12">
                        {featureCategories.map((category, index) => (
                            <div
                                key={index}
                                className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                            >
                                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-4xl">{category.icon}</span>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {category.title}
                                        </h3>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {category.features.map((feature, fIndex) => (
                                            <div key={fIndex} className="flex items-start gap-3">
                                                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`bg-gradient-to-br rounded-2xl p-12 flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''} ${
                                  category.color === 'blue' ? 'from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20' :
                                  category.color === 'green' ? 'from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20' :
                                  category.color === 'purple' ? 'from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20' :
                                  category.color === 'orange' ? 'from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20' :
                                  category.color === 'red' ? 'from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20' :
                                  category.color === 'indigo' ? 'from-indigo-100 to-indigo-200 dark:from-indigo-900/20 dark:to-indigo-800/20' : ''
                                }`}>
                                    <span className="text-8xl">{category.icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800/50" aria-label="Additional features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            And Much More...
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Additional capabilities to streamline your institution's operations
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[
                            'Multi-branch Support',
                            'Custom Branding',
                            'API Integration',
                            'Data Export (CSV, PDF)',
                            'Backup & Recovery',
                            'Multi-language Support',
                            'Mobile Responsive',
                            'Role-based Access',
                            'Audit Logs',
                            'Performance Reports',
                            'Question Bank',
                            'Secure Login (OAuth2)',
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 card-hover focus-ring"
                                tabIndex={0}
                            >
                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20" aria-label="Call to action">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Transform your examination process with OERMS. Start your free trial today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transition-colors focus-ring"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/50 rounded-xl hover:bg-white/10 transition-colors focus-ring"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
