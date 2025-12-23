'use client';

import { useState } from 'react';

export type QuestionType =
    | 'MCQ'
    | 'MULTIPLE_ANSWER'
    | 'TRUE_FALSE'
    | 'SHORT_ANSWER'
    | 'ESSAY'
    | 'FILL_BLANK'
    | 'MATCHING';

export interface QuestionOption {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    questionText: string;
    type: QuestionType;
    marks: number;
    options?: QuestionOption[];
    imageUrl?: string;
}

export interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    selectedOptions?: string[];
    answerText?: string;
    isFlagged?: boolean;
    onOptionSelect?: (optionIds: string[]) => void;
    onAnswerTextChange?: (text: string) => void;
    onFlagToggle?: () => void;
    className?: string;
}

export function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    selectedOptions = [],
    answerText = '',
    isFlagged = false,
    onOptionSelect,
    onAnswerTextChange,
    onFlagToggle,
    className = '',
}: QuestionCardProps) {
    const handleSingleSelect = (optionId: string) => {
        onOptionSelect?.([optionId]);
    };

    const handleMultiSelect = (optionId: string) => {
        const newSelection = selectedOptions.includes(optionId)
            ? selectedOptions.filter((id) => id !== optionId)
            : [...selectedOptions, optionId];
        onOptionSelect?.(newSelection);
    };

    const renderOptions = () => {
        if (!question.options) return null;

        const isMultiple = question.type === 'MULTIPLE_ANSWER';
        const isTrueFalse = question.type === 'TRUE_FALSE';

        return (
            <div className="space-y-3">
                {question.options.map((option, index) => {
                    const isSelected = selectedOptions.includes(option.id);
                    const letter = String.fromCharCode(65 + index);

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                                isMultiple
                                    ? handleMultiSelect(option.id)
                                    : handleSingleSelect(option.id)
                            }
                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all
                ${isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }
              `}
                        >
                            <span
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isSelected
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }
                `}
                            >
                                {isTrueFalse ? (index === 0 ? 'T' : 'F') : letter}
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                                {option.text}
                            </span>
                            {isMultiple && (
                                <span className="ml-auto">
                                    <svg
                                        className={`w-5 h-5 ${isSelected ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        {isSelected ? (
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        ) : (
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                                                clipRule="evenodd"
                                            />
                                        )}
                                    </svg>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderTextAnswer = () => {
        const isEssay = question.type === 'ESSAY';

        if (isEssay) {
            return (
                <textarea
                    value={answerText}
                    onChange={(e) => onAnswerTextChange?.(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={8}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-0 resize-y"
                />
            );
        }

        return (
            <input
                type="text"
                value={answerText}
                onChange={(e) => onAnswerTextChange?.(e.target.value)}
                placeholder="Type your answer..."
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-0"
            />
        );
    };

    const getQuestionTypeLabel = () => {
        const labels: Record<QuestionType, string> = {
            MCQ: 'Multiple Choice',
            MULTIPLE_ANSWER: 'Select All That Apply',
            TRUE_FALSE: 'True or False',
            SHORT_ANSWER: 'Short Answer',
            ESSAY: 'Essay',
            FILL_BLANK: 'Fill in the Blank',
            MATCHING: 'Matching',
        };
        return labels[question.type];
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {getQuestionTypeLabel()}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                    </span>
                    <button
                        type="button"
                        onClick={onFlagToggle}
                        className={`p-2 rounded-lg transition-colors ${isFlagged
                                ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/30'
                                : 'text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        title={isFlagged ? 'Unflag question' : 'Flag for review'}
                    >
                        <svg
                            className="w-5 h-5"
                            fill={isFlagged ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Question Content */}
            <div className="p-6">
                {/* Question Text */}
                <div className="mb-6">
                    <p className="text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
                        {question.questionText}
                    </p>
                    {question.imageUrl && (
                        <div className="mt-4">
                            <img
                                src={question.imageUrl}
                                alt="Question illustration"
                                className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                        </div>
                    )}
                </div>

                {/* Answer Input */}
                {(question.type === 'MCQ' ||
                    question.type === 'MULTIPLE_ANSWER' ||
                    question.type === 'TRUE_FALSE') &&
                    renderOptions()}
                {(question.type === 'SHORT_ANSWER' ||
                    question.type === 'ESSAY' ||
                    question.type === 'FILL_BLANK') &&
                    renderTextAnswer()}
            </div>
        </div>
    );
}

export default QuestionCard;
