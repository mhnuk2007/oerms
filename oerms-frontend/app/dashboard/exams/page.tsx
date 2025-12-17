'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { ExamDTO } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Plus, Search, MoreVertical, FileEdit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils'; // I might need to create this helper or use valid js

export default function ExamListPage() {
    const { user } = useAuth();
    const [exams, setExams] = useState<ExamDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const router = useRouter();

    const fetchExams = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.getMyExams({ size: 100 }); // Fetch all for now, modify for pagination later
            setExams(response.content);
        } catch (error) {
            console.error('Failed to fetch exams:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage your specific exams.</p>
                </div>
                <Link href="/dashboard/exams/create">
                    <Button variant="primary" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create New Exam
                    </Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search exams..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading exams...</div>
                    ) : filteredExams.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="mb-4 bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <FileEdit className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No exams found</h3>
                            <p className="mb-4">Get started by creating your first exam.</p>
                            <Link href="/dashboard/exams/create">
                                <Button variant="outline" size="sm">Create Exam</Button>
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Marks</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredExams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{exam.title}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-xs">{exam.description || 'No description'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${exam.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                                                    exam.status === 'DRAFT' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300' :
                                                        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                }`}>
                                                {exam.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {exam.duration} mins
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {exam.totalMarks}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/dashboard/exams/${exam.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details">
                                                        <Eye className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/dashboard/exams/${exam.id}/edit`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                                                        <FileEdit className="w-4 h-4 text-gray-500" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
