'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api';
import { ResultSummaryDTO, ExamDTO } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminResultsPage() {
    const router = useRouter();
    const { hasRole, user } = useAuth();
    const [exams, setExams] = useState<ExamDTO[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [results, setResults] = useState<ResultSummaryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [error, setError] = useState<string>('');
    const [pendingResults, setPendingResults] = useState<ResultSummaryDTO[]>([]);
    const [suspiciousResults, setSuspiciousResults] = useState<ResultSummaryDTO[]>([]);

    const isAdmin = hasRole('ADMIN');
    const isTeacher = hasRole('TEACHER');
    const hasAccess = isAdmin || isTeacher;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError('');

                // Load published exams for selection
                const examsResponse = await apiClient.getPublishedExams({ page: 0, size: 100 });
                const examsData = examsResponse.data || examsResponse;
                setExams(examsData.content || []);

                // Load pending grading results
                const pendingResponse = await apiClient.getPendingGradingResults();
                const pendingData = pendingResponse.data || pendingResponse || [];
                setPendingResults(pendingData);

                // Load suspicious results
                const suspiciousResponse = await apiClient.getSuspiciousResults();
                const suspiciousData = suspiciousResponse.data || suspiciousResponse || [];
                setSuspiciousResults(suspiciousData);

            } catch (err: any) {
                setError(err.message || 'Failed to load data');
                console.error('Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedExamId) {
            loadExamResults(selectedExamId);
        } else {
            setResults([]);
        }
    }, [selectedExamId]);

    const loadExamResults = async (examId: string) => {
        try {
            setLoadingResults(true);
            setError('');

            const resultsResponse = await apiClient.getExamResultsAdmin(examId, { page: 0, size: 50 });
            const resultsData = resultsResponse.data || resultsResponse;
            setResults(resultsData.content || []);
        } catch (err: any) {
            setError(`Failed to load results for selected exam: ${err.message}`);
            console.error('Failed to load exam results:', err);
        } finally {
            setLoadingResults(false);
        }
    };



    const handlePublishResult = async (resultId: string) => {
        try {
            await apiClient.publishResultAdmin(resultId, {
                resultId,
                comments: 'Published by admin'
            });
            // Update the result status
            setResults(prev => prev.map(r =>
                r.id === resultId ? { ...r, status: 'PUBLISHED' } : r
            ));
            setPendingResults(prev => prev.filter(r => r.id !== resultId));
        } catch (err) {
            console.error('Failed to publish result:', err);
        }
    };

    const handleUnpublishResult = async (resultId: string) => {
        try {
            await apiClient.unpublishResultAdmin(resultId);
            // Update the result status
            setResults(prev => prev.map(r =>
                r.id === resultId ? { ...r, status: 'DRAFT' } : r
            ));
        } catch (err) {
            console.error('Failed to unpublish result:', err);
        }
    };

    const handleGradeResult = async (resultId: string) => {
        const obtainedMarks = prompt('Enter obtained marks:');
        if (obtainedMarks !== null) {
            try {
                await apiClient.gradeResultAdmin(resultId, {
                    resultId,
                    obtainedMarks: parseFloat(obtainedMarks),
                    comments: 'Graded by admin'
                });
                // Update the result status
                setResults(prev => prev.map(r =>
                    r.id === resultId ? { ...r, status: 'GRADED' } : r
                ));
                setPendingResults(prev => prev.filter(r => r.id !== resultId));
            } catch (err) {
                console.error('Failed to grade result:', err);
            }
        }
    };

    const handleDeleteResult = async (resultId: string) => {
        if (confirm('Are you sure you want to delete this result? This action cannot be undone.')) {
            try {
                await apiClient.deleteResultAdmin(resultId);
                setResults(prev => prev.filter(r => r.id !== resultId));
                setPendingResults(prev => prev.filter(r => r.id !== resultId));
                setSuspiciousResults(prev => prev.filter(r => r.id !== resultId));
            } catch (err) {
                console.error('Failed to delete result:', err);
            }
        }
    };

    const handleCalculateRankings = async (examId: string) => {
        try {
            await apiClient.calculateRankingsAdmin(examId);
            alert('Rankings calculated successfully!');
        } catch (err) {
            console.error('Failed to calculate rankings:', err);
            alert('Failed to calculate rankings');
        }
    };

    if (!hasAccess) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-red-600">Access denied. Teacher or Admin privileges required.</p>
                </div>
            </DashboardLayout>
        );
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Result Management</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Review, publish, and manage exam results</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Pending Grading</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-orange-600">{pendingResults.length}</p>
                        <p className="text-sm text-gray-500">Results awaiting review</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Suspicious Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-600">{suspiciousResults.length}</p>
                        <p className="text-sm text-gray-500">Require attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Total Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600">{results.length}</p>
                        <p className="text-sm text-gray-500">All results</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Grading Section */}
            {pendingResults.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pending Grading</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {pendingResults.map((result) => (
                            <Card key={result.id} className="border-orange-200 dark:border-orange-800">
                                <CardHeader>
                                    <CardTitle className="text-lg">{result.examTitle}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                            {result.status}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Score: {result.obtainedMarks}/{result.totalMarks} ({result.percentage}%)
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Link href={`/results/${result.id}`}>
                                                <Button variant="outline" size="sm">View Details</Button>
                                            </Link>
                                            <Link href={`/results/${result.id}/grade`}>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    Grade Now
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Suspicious Results Section */}
            {suspiciousResults.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Suspicious Results</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {suspiciousResults.map((result) => (
                            <Card key={result.id} className="border-red-200 dark:border-red-800">
                                <CardHeader>
                                    <CardTitle className="text-lg">{result.examTitle}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                            SUSPICIOUS
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Score: {result.obtainedMarks}/{result.totalMarks} ({result.percentage}%)
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Link href={`/results/${result.id}`}>
                                                <Button variant="outline" size="sm">Review</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Exam Results Viewer */}
            <Card>
                <CardHeader>
                    <CardTitle>Exam Results</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-md">
                            <select
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select an exam to view results</option>
                                {exams.map((exam) => (
                                    <option key={exam.id} value={exam.id}>
                                        {exam.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedExamId && (
                            <Button
                                onClick={() => handleCalculateRankings(selectedExamId)}
                                variant="outline"
                                size="sm"
                            >
                                Calculate Rankings
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingResults ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : selectedExamId ? (
                        results.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Exam</th>
                                            <th className="px-6 py-4">Score</th>
                                            <th className="px-6 py-4">Grade</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Result</th>
                                            <th className="px-6 py-4">Published</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {results.map((result) => (
                                            <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {result.examTitle}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium">
                                                        {result.obtainedMarks}/{result.totalMarks} ({result.percentage}%)
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {result.grade || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        result.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                                        result.status === 'PENDING_GRADING' ? 'bg-orange-100 text-orange-800' :
                                                        result.status === 'GRADED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {result.status?.replace('_', ' ') || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {result.passed ? 'Passed' : 'Failed'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    {result.publishedAt ? new Date(result.publishedAt).toLocaleDateString() : 'Not published'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Link href={`/results/${result.id}`}>
                                                            <Button variant="ghost" size="sm">View</Button>
                                                        </Link>

                                                        {result.status === 'GRADED' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-green-700 hover:text-green-800"
                                                                onClick={() => handlePublishResult(result.id)}
                                                            >
                                                                Publish
                                                            </Button>
                                                        )}

                                                        {result.status === 'PUBLISHED' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-orange-700 hover:text-orange-800"
                                                                onClick={() => handleUnpublishResult(result.id)}
                                                            >
                                                                Unpublish
                                                            </Button>
                                                        )}

                                                        {/* Grade button - available for both teachers and admins */}
                                                        {result.status === 'PENDING_GRADING' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-blue-700 hover:text-blue-800"
                                                                onClick={() => handleGradeResult(result.id)}
                                                            >
                                                                Grade
                                                            </Button>
                                                        )}

                                                        {/* Delete button - only for admins */}
                                                        {isAdmin && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() => handleDeleteResult(result.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No results found for the selected exam.</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Select an exam from the dropdown above to view its results.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
