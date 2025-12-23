'use client';

export interface QuestionStatus {
    id: string;
    isAnswered: boolean;
    isFlagged: boolean;
}

interface QuestionNavigationProps {
    questions: QuestionStatus[];
    currentQuestionIndex: number;
    onQuestionSelect: (index: number) => void;
    className?: string;
}

export function QuestionNavigation({
    questions,
    currentQuestionIndex,
    onQuestionSelect,
    className = '',
}: QuestionNavigationProps) {
    const getButtonStyles = (question: QuestionStatus, index: number) => {
        const isCurrent = index === currentQuestionIndex;

        if (isCurrent) {
            return 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 bg-blue-500 text-white';
        }
        if (question.isFlagged) {
            return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700';
        }
        if (question.isAnswered) {
            return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700';
        }
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600';
    };

    const answeredCount = questions.filter((q) => q.isAnswered).length;
    const flaggedCount = questions.filter((q) => q.isFlagged).length;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Question Navigator
            </h3>

            {/* Stats */}
            <div className="flex gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-600 dark:text-gray-300">
                        Answered: {answeredCount}/{questions.length}
                    </span>
                </div>
                {flaggedCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                        <span className="text-gray-600 dark:text-gray-300">
                            Flagged: {flaggedCount}
                        </span>
                    </div>
                )}
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                    <button
                        key={question.id}
                        type="button"
                        onClick={() => onQuestionSelect(index)}
                        className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${getButtonStyles(question, index)}`}
                    >
                        {index + 1}
                        {question.isFlagged && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"></span>
                        Not Answered
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700"></span>
                        Answered
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-700"></span>
                        Flagged
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-blue-500"></span>
                        Current
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionNavigation;
