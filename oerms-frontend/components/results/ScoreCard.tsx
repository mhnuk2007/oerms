'use client';

interface ScoreCardProps {
    score: number;
    totalMarks: number;
    passingMarks?: number;
    className?: string;
}

export function ScoreCard({
    score,
    totalMarks,
    passingMarks,
    className = '',
}: ScoreCardProps) {
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const isPassed = passingMarks ? score >= passingMarks : percentage >= 40;

    const getGrade = () => {
        if (percentage >= 90) return { grade: 'A+', color: 'text-green-600 dark:text-green-400' };
        if (percentage >= 80) return { grade: 'A', color: 'text-green-600 dark:text-green-400' };
        if (percentage >= 70) return { grade: 'B', color: 'text-blue-600 dark:text-blue-400' };
        if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600 dark:text-yellow-400' };
        if (percentage >= 50) return { grade: 'D', color: 'text-orange-600 dark:text-orange-400' };
        return { grade: 'F', color: 'text-red-600 dark:text-red-400' };
    };

    const { grade, color } = getGrade();

    // Calculate stroke dasharray for circular progress
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
            <div className="flex flex-col items-center">
                {/* Circular Progress */}
                <div className="relative w-40 h-40 mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                        {/* Background circle */}
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            className={isPassed ? 'text-green-500' : 'text-red-500'}
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset,
                                transition: 'stroke-dashoffset 0.5s ease-in-out',
                            }}
                        />
                    </svg>
                    {/* Percentage text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${color}`}>{percentage}%</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Score</span>
                    </div>
                </div>

                {/* Grade Badge */}
                <div className={`text-5xl font-bold mb-2 ${color}`}>{grade}</div>

                {/* Score Details */}
                <div className="text-center">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{score}</span>
                        <span className="text-gray-600 dark:text-gray-300"> / {totalMarks} marks</span>
                    </p>
                    {passingMarks && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Passing marks: {passingMarks}
                        </p>
                    )}
                </div>

                {/* Pass/Fail Badge */}
                <div
                    className={`mt-4 px-4 py-2 rounded-full text-sm font-medium ${isPassed
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                >
                    {isPassed ? '✓ Passed' : '✗ Failed'}
                </div>
            </div>
        </div>
    );
}

export default ScoreCard;
