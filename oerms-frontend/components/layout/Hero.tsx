import Link from 'next/link';
import { Button } from '../ui/Button';

export function Hero() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Online Exam & Result
            <span className="block text-blue-200">Management System</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
            A modern, secure, and scalable platform for conducting online examinations
            and managing results with role-based access control.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`${process.env.NEXT_PUBLIC_OERMS_ISSUER}/register`}>
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50">
                Get Started
              </Button>
            </a>

            <Link href="/api/auth/start">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-blue-700">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
