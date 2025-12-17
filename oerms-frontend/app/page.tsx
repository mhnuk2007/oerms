'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '📄',
      title: 'Automated OMR Assessment',
      description: 'Generate customized OMR sheets with student details, scan completed sheets, and let OERMS evaluate them with unmatched accuracy.',
    },
    {
      icon: '🏫',
      title: 'Student Information System',
      description: 'Manage student profiles, admission, records, photos, attendance, fees, and more in one centralized platform.',
    },
    {
      icon: '📊',
      title: 'Exam & Result Management',
      description: 'Create exams, upload marks, publish results, generate rank lists, download PDFs, and send notifications instantly.',
    },
    {
      icon: '📥',
      title: 'Bulk Upload & Download',
      description: 'Import students, exams, and results with a single click—efficient for large institutions.',
    },
    {
      icon: '📲',
      title: 'WhatsApp & Email Notifications',
      description: 'Instantly inform students and parents about marks, attendance, fee reminders, and exam schedules.',
    },
    {
      icon: '👨‍🏫',
      title: 'Role-Based Dashboards',
      description: 'Custom dashboards for Admin, Teachers, Students, and Parents provide a seamless user experience.',
    },
  ];

  const testimonials = [
    {
      quote: "OERMS reduced our exam processing time from 7 days to just 8 hours. The accuracy is exceptional.",
      author: "Principal",
      institution: "Crescent Public School",
    },
    {
      quote: "Our teachers love the automated OMR evaluation. It's fast and eliminates errors completely.",
      author: "Academic Coordinator",
      institution: "Scholars Academy",
    },
    {
      quote: "The parent portal has transformed how we communicate results. Parents are thrilled with instant access.",
      author: "Administrator",
      institution: "City International School",
    },
  ];

  const valueProps = [
    'Automated OMR Sheet Generation',
    'Smart OMR Scanning & Evaluation',
    'Real-Time Result Processing',
    'Secure Student Portals',
    'Role-Based Access for Admins, Teachers & Parents',
    'WhatsApp Result Notifications',
    'Fully Cloud-Ready Architecture',
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-white/90 text-sm font-medium">Trusted by 100+ Educational Institutions</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              The Future of Assessment
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                Begins Here
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              A complete, AI-assisted, OMR-powered examination and results management system for schools,
              colleges, coaching centers, and universities. Designed to simplify operations, reduce workload,
              and deliver accurate results—instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/register"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl shadow-lg shadow-blue-900/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
                  >
                    Request a Demo
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Go to Dashboard
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 100L60 90C120 80 240 60 360 50C480 40 600 40 720 45C840 50 960 60 1080 65C1200 70 1320 70 1380 70L1440 70V100H0Z" fill="currentColor" className="text-white dark:text-gray-900" />
          </svg>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 bg-white dark:bg-gray-900" aria-label="Social proof">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Trusted by institutions worldwide
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 opacity-80">
              <img src="/images/vercel.svg" alt="Partner vercel" className="h-6" />
              <img src="/images/next.svg" alt="Partner next" className="h-6" />
              <img src="/images/window.svg" alt="Partner window" className="h-6" />
              <img src="/images/globe.svg" alt="Partner globe" className="h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Fast. Reliable. Built for Institutions.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              OERMS transforms traditional examination workflows into a fully digital, automated, and intelligent process.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {valueProps.map((prop, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{prop}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
              Core Features
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything Your Institute Needs—In One Platform
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From exam creation to result publishing, we've got every aspect covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Core features">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/features"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Explore All Features
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50" aria-label="How it works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get from exam creation to published results in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 card-hover">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4 font-bold">1</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create</h3>
              <p className="text-gray-600 dark:text-gray-400">Set up exams, upload questions, define scoring and timing with intuitive tools.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 card-hover">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center mb-4 font-bold">2</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Conduct</h3>
              <p className="text-gray-600 dark:text-gray-400">Students take exams online or via OMR; autosave, proctoring, and timer ensure integrity.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 card-hover">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-4 font-bold">3</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Publish</h3>
              <p className="text-gray-600 dark:text-gray-400">Instantly evaluate, analyze analytics, and publish results with notifications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '50,000+', label: 'Students Managed' },
              { value: '500+', label: 'Teachers Active' },
              { value: '100,000+', label: 'Exams Conducted' },
              { value: '99.9%', label: 'Accuracy Rate' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Trusted by Educators and Institutions
            </h2>
          </div>

          <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 overflow-x-auto md:grid-flow-row md:grid-cols-3 md:gap-8 md:overflow-visible snap-x snap-mandatory" aria-label="Testimonials">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Different Users */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Designed for Everyone
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A tailored experience for every stakeholder in education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Institutions', icon: '🏫', desc: 'Complete exam management, result publishing, and analytics' },
              { role: 'Teachers', icon: '👨‍🏫', desc: 'Create exams, grade papers, and track student progress' },
              { role: 'Students', icon: '👨‍🎓', desc: 'Take exams, view results, and track performance' },
              { role: 'Parents', icon: '👨‍👩‍👧', desc: 'Monitor progress, receive notifications, and stay informed' },
            ].map((user, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{user.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{user.role}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{user.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Institute?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Experience modern, automated examination with OERMS. Join hundreds of institutions already using our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Today
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/50 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  Book a Free Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

          </div>
  );
}
