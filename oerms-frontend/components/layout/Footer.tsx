import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">OERMS</h3>
            <p className="text-gray-600 text-sm">
              A comprehensive platform for online examination management built with modern microservices architecture.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">Home</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm">About</Link></li>
              <li><Link href="/api/auth/start" className="text-gray-600 hover:text-gray-900 text-sm">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Spring Boot</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Next.js</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Kafka</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">PostgreSQL</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} OERMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
