import Link from "next/link";
import { useAuth } from "./components/AuthProvider";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Online Examination & 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
                {" "}Result Management
              </span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              A comprehensive, secure platform for creating, conducting, and analyzing online examinations. 
              Built with modern technologies and designed for educational institutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/auth/login" 
                className="btn btn-primary btn-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Link>
              <Link 
                href="#features" 
                className="btn btn-outline btn-xl px-8 py-4 text-lg font-semibold"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
                <div className="text-neutral-600">Exams Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">50K+</div>
                <div className="text-neutral-600">Students Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
                <div className="text-neutral-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Everything you need to manage online examinations efficiently and securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card card-interactive group">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Role-Based Access Control</h3>
              <p className="text-neutral-600 mb-4">
                Secure JWT authentication with distinct workflows for Administrators, Teachers, and Students. 
                Granular permissions ensure data security and proper access control.
              </p>
              <ul className="text-sm text-neutral-500 space-y-1">
                <li>• Multi-role authentication</li>
                <li>• Granular permissions</li>
                <li>• Session management</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="card card-interactive group">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-success-200 transition-colors">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Timed Online Examinations</h3>
              <p className="text-neutral-600 mb-4">
                Advanced exam interface with real-time timers, auto-save functionality, and progress tracking. 
                Support for both MCQ and subjective questions with instant feedback.
              </p>
              <ul className="text-sm text-neutral-500 space-y-1">
                <li>• Real-time timer</li>
                <li>• Auto-save answers</li>
                <li>• Progress indicators</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="card card-interactive group">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-warning-200 transition-colors">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Advanced Analytics</h3>
              <p className="text-neutral-600 mb-4">
                Comprehensive performance analytics with detailed insights, score distributions, 
                and question-level analysis to help improve teaching effectiveness.
              </p>
              <ul className="text-sm text-neutral-500 space-y-1">
                <li>• Performance metrics</li>
                <li>• Score distributions</li>
                <li>• Question analytics</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="card card-interactive group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Real-time Notifications</h3>
              <p className="text-neutral-600 mb-4">
                Instant notifications via Email and WhatsApp for exam updates, results, and important announcements. 
                Built on Kafka messaging for reliable delivery.
              </p>
              <ul className="text-sm text-neutral-500 space-y-1">
                <li>• Email notifications</li>
                <li>• WhatsApp integration</li>
                <li>• Real-time updates</li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="card card-interactive group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Question Management</h3>
              <p className="text-neutral-600 mb-4">
                Easy creation and management of questions with support for multiple question types, 
                bulk upload, and question banks for efficient exam preparation.
              </p>
              <ul className="text-sm text-neutral-500 space-y-1">
                <li>• Multiple question types</li>
                <li>• Bulk upload support</li>
                <li>• Question banks</li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="card card-interactive group">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Microservices Architecture</h3>
              <p className="text-neutral-600 mb-4">
                Built with Spring Cloud microservices for scalability and reliability. 
                Separate services for exams, questions, results, users, and notifications.
              </p>
              <ul className="text-sm text-neutral-500 space-y-1">
                <li>• Scalable architecture</li>
                <li>• Service isolation</li>
                <li>• High availability</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Examination Process?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of educational institutions already using OERMS to streamline their examination workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/login" 
                className="btn btn-lg px-8 py-4 text-lg font-semibold bg-white text-primary-600 hover:bg-primary-50 shadow-lg"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/contact" 
                className="btn btn-outline btn-lg px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white hover:text-primary-600"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-neutral-900 text-white">
        <div className="container">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-bold">OERMS</span>
            </div>
            <p className="text-neutral-400 mb-4">
              Connect backend via <span className="font-mono bg-neutral-800 px-2 py-1 rounded">NEXT_PUBLIC_API_BASE</span>
            </p>
            <p className="text-neutral-500 text-sm">
              Powered by Next.js & Spring Cloud | © 2024 OERMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
