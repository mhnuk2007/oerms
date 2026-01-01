import React, { useEffect, useState } from 'react';
import { adminService, SystemHealth, DashboardStats } from '../../lib/api/admin';
import Link from 'next/link';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalExams: 0,
    totalAttempts: 0,
    pendingGrading: 0
  });
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, healthData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getSystemHealth()
        ]);
        setStats(statsData);
        setHealth(healthData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getHealthColor = (status?: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 bg-green-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
          <p className="text-gray-600">System overview and management tools</p>
        </div>
        {health && (
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getHealthColor(health.status)}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="font-medium">
              {health.status === 'HEALTHY' ? 'All systems operational' : `System Status: ${health.status}`}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          subtitle="Registered accounts"
          icon="👥"
        />
        <StatCard 
          title="Total Exams" 
          value={stats.totalExams} 
          subtitle="Created assessments"
          icon="📝"
        />
        <StatCard 
          title="Student Attempts" 
          value={stats.totalAttempts} 
          subtitle="Total submissions"
          icon="✍️"
        />
        <StatCard 
          title="Pending Grading" 
          value={stats.pendingGrading} 
          subtitle="Results awaiting review"
          icon="⏳"
          highlight={stats.pendingGrading > 0}
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overall Health</span>
              <span className={`font-medium ${health?.status === 'HEALTHY' ? 'text-green-600' : 'text-red-600'}`}>
                {health?.status || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Uptime</span>
              <span className="font-mono text-sm">
                {health ? formatUptime(health.uptime) : '-'}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-4">
              Last checked: {health?.lastCheck ? new Date(health.lastCheck).toLocaleTimeString() : '-'}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard 
            title="User Management" 
            description="Manage user accounts and roles"
            href="/admin/users"
            color="bg-blue-50 text-blue-700 hover:bg-blue-100"
          />
          <ActionCard 
            title="Exam Administration" 
            description="Oversee all exam content"
            href="/admin/exams"
            color="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          />
          <ActionCard 
            title="Student Attempts" 
            description="View student submission history"
            href="/admin/attempts"
            color="bg-orange-50 text-orange-700 hover:bg-orange-100"
          />
          <ActionCard 
            title="Result Management" 
            description="Review and publish results"
            href="/admin/results"
            color="bg-purple-50 text-purple-700 hover:bg-purple-100"
          />
          <ActionCard 
            title="Analytics & Reports" 
            description="System insights and metrics"
            href="/admin/analytics"
            color="bg-teal-50 text-teal-700 hover:bg-teal-100"
          />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, highlight }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border ${highlight ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  color: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, href, color }) => (
  <Link href={href} className={`p-6 rounded-xl transition-colors ${color}`}>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm opacity-80">{description}</p>
  </Link>
);

export default AdminDashboard;