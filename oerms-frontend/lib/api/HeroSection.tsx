import React from 'react';
import Link from 'next/link';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-white dark:bg-gray-900 overflow-hidden pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white dark:bg-gray-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Secure & Scalable</span>{' '}
                <span className="block text-indigo-600 xl:inline">Online Examination</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                OERMS is a next-generation examination platform built on microservices. 
                Experience AI-powered proctoring, real-time analytics, and seamless 
                assessment management for institutions of all sizes.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    href="/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    href="/demo"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700"
                  >
                    Live Demo
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="relative w-full h-64 sm:h-72 md:h-96 lg:h-full">
           {/* Placeholder for Hero Image/Illustration */}
           <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🖥️</span>
                <div className="grid grid-cols-2 gap-4 p-8 opacity-50">
                   <div className="bg-white dark:bg-gray-700 p-4 rounded shadow-sm h-24 w-32"></div>
                   <div className="bg-white dark:bg-gray-700 p-4 rounded shadow-sm h-24 w-32 mt-8"></div>
                   <div className="bg-white dark:bg-gray-700 p-4 rounded shadow-sm h-24 w-32 -mt-8"></div>
                   <div className="bg-white dark:bg-gray-700 p-4 rounded shadow-sm h-24 w-32"></div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};