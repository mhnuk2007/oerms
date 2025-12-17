'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ExamDTO } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { Clock, Trophy, ArrowRight, BookOpen, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function AvailableExamsPage() {
    const [exams, setExams] = useState<ExamDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'createdAt' | 'title'>('createdAt');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await apiClient.getPublishedExams({ size: 100 });
                // Extract data from API response wrapper
                const data = response?.data || response;
                setExams(data.content || []);
            } catch (error) {
                console.error('Failed to fetch exams:', error);
                setExams([]); // Set empty array on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchExams();
    }, []);

    const filteredSortedExams = useMemo(() => {
        const q = search.trim().toLowerCase();
        let list = exams;
        if (q) {
            list = list.filter(e =>
                e.title?.toLowerCase().includes(q) ||
                e.description?.toLowerCase().includes(q)
            );
        }
        return [...list].sort((a, b) => {
            if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
            const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return db - da;
        });
    }, [exams, search, sortBy]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Exams</h1>
                    <p className="text-gray-500 dark:text-gray-400">Select an exam to start your assessment.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3" aria-label="Exam filters and sorting">
                    <div className="relative max-w-md w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search exams..."
                            className="w-full pl-3 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            aria-label="Search exams"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="sortBy" className="text-sm text-gray-600 dark:text-gray-300">Sort by</label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            aria-label="Sort exams"
                        >
                            <option value="createdAt">Recently added</option>
                            <option value="title">Title</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredSortedExams.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Exams Found</h3>
                        <p className="text-gray-500 dark:text-gray-400">No results match your filters. Try adjusting them.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Published exams">
                        {filteredSortedExams.map((exam) => (
                            <div key={exam.id} role="listitem" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all group">
                                <div className="mb-4 flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {exam.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[2.5rem]">
                                            {exam.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <Badge variant="success" size="sm">Published</Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{exam.duration}m</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Trophy className="w-4 h-4" />
                                        <span>{exam.totalMarks} marks</span>
                                    </div>
                                </div>

                                {(exam.startTime || exam.endTime) && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {exam.startTime ? `Starts: ${formatDate(exam.startTime)}` : ''}
                                            {exam.startTime && exam.endTime ? ' · ' : ''}
                                            {exam.endTime ? `Ends: ${formatDate(exam.endTime)}` : ''}
                                        </span>
                                    </div>
                                )}

                                <Link href={`/exams/${exam.id}`} className="block">
                                    <Button className="w-full justify-between group-hover:bg-blue-600 group-hover:text-white">
                                        View Details
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
