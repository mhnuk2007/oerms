'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { useToast } from '@/components/ui/Toast';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        institution: '',
        phone: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSubmitted(true);
        addToast('Message sent. We will get back within 24 hours.', 'success');
        setIsSubmitting(false);
    };

    const contactInfo = [
        {
            icon: '📧',
            title: 'Email',
            value: 'support@oerms.com',
            description: 'We respond within 24 hours',
        },
        {
            icon: '📞',
            title: 'Phone',
            value: '+92-xxx-xxxxxxx',
            description: 'Mon-Fri, 9am-6pm PKT',
        },
        {
            icon: '📍',
            title: 'Location',
            value: 'Karachi, Pakistan',
            description: 'Serving institutions worldwide',
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-900">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 py-20" aria-label="Contact overview">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Let's Work Together!
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Whether you're running a coaching center or a large institution, OERMS is ready to support your academic needs.
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-16" aria-label="Contact information">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {contactInfo.map((info, index) => (
                            <div
                                key={index}
                                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center card-hover focus-ring"
                                tabIndex={0}
                            >
                                <div className="text-4xl mb-4">{info.icon}</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{info.title}</h3>
                                <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-1">{info.value}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{info.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-16 bg-gray-50 dark:bg-gray-800/50" aria-label="Contact form">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 lg:p-12">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Send Us a Message
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Fill out the form below and we'll get back to you within 24 hours.
                            </p>
                        </div>

                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Message Sent Successfully!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Thank you for reaching out. We'll get back to you soon.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            aria-required="true"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            aria-required="true"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="john@institution.edu"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="institution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Institution Name
                                        </label>
                                        <input
                                            type="text"
                                            id="institution"
                                            value={formData.institution}
                                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="ABC School"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="+92-xxx-xxxxxxx"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        required
                                        aria-required="true"
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Tell us about your requirements..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16" aria-label="Contact FAQ">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { q: 'How long does it take to get started?', a: 'You can sign up and start using OERMS within minutes. Our onboarding process is simple and intuitive.' },
                            { q: 'Do you offer training for our staff?', a: 'Yes! We provide comprehensive training and documentation to help your team get the most out of OERMS.' },
                            { q: 'Can OERMS handle large institutions?', a: 'Absolutely. OERMS is built for scalability and can handle institutions with thousands of students.' },
                            { q: 'Is my data secure?', a: 'Yes. We use enterprise-grade security including OAuth2, encryption, and regular backups to protect your data.' },
                        ].map((faq, index) => (
                            <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
