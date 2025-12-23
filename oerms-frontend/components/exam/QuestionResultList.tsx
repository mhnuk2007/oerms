"use client";

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle, X, AlertTriangle, Clock, BookOpen, FileText, Target, HelpCircle } from 'lucide-react';
import { AttemptResultDetailDTO, QuestionType } from '@/lib/types';

interface QuestionResultListProps {
  details: AttemptResultDetailDTO[];
}

export function QuestionResultList({ details }: QuestionResultListProps) {
  const shouldReduceMotion = useReducedMotion() || false;

  if (!details || details.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
      >
        <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">No question details available.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.4 }}
    >
      {details.map((detail, index) => (
        <QuestionResultItem key={detail.questionId} detail={detail} index={index} />
      ))}
    </motion.div>
  );
}

function QuestionResultItem({ detail, index }: { detail: AttemptResultDetailDTO; index: number }) {
  const shouldReduceMotion = useReducedMotion() || false;
  const isCorrect = detail.isCorrect === true;
  const isPartial = detail.marksObtained && detail.marksObtained > 0 && detail.marksObtained < detail.marksAllocated;

  let statusConfig = {
    color: "border-red-200 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20",
    badgeColor: "bg-red-100 text-red-800 border-red-200",
    statusText: "Incorrect",
    icon: <X className="w-5 h-5 text-red-500" />,
    glow: "shadow-red-500/20"
  };

  if (isCorrect) {
    statusConfig = {
      color: "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      badgeColor: "bg-green-100 text-green-800 border-green-200",
      statusText: "Correct",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      glow: "shadow-green-500/20"
    };
  } else if (isPartial) {
    statusConfig = {
      color: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
      badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
      statusText: "Partial",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      glow: "shadow-yellow-500/20"
    };
  }

  const getQuestionTypeIcon = () => {
    const icons: Record<QuestionType, React.ReactNode> = {
      MCQ: <BookOpen className="w-4 h-4" />,
      MULTIPLE_ANSWER: <Target className="w-4 h-4" />,
      TRUE_FALSE: <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-blue-400" />,
      SHORT_ANSWER: <div className="w-4 h-4 border-b-2 border-gray-400" />,
      ESSAY: <FileText className="w-4 h-4" />,
      FILL_BLANK: <div className="w-4 h-4 border-b-2 border-dashed border-gray-400" />,
      MATCHING: <div className="w-4 h-4 flex items-center justify-center text-xs font-bold">↔</div>,
    };
    return icons[detail.questionType] || <HelpCircle className="w-4 h-4" />;
  };

  return (
    <motion.div
      className={cn(
        "border-2 rounded-2xl p-6 overflow-hidden relative",
        statusConfig.color,
        `shadow-lg ${statusConfig.glow}`
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={!shouldReduceMotion ? { scale: 1.02 } : undefined}
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <motion.div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2",
            statusConfig.badgeColor
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 400, damping: 17 }}
        >
          {statusConfig.icon}
          {statusConfig.statusText}
        </motion.div>
      </div>

      {/* Header */}
      <motion.div
        className="flex justify-between items-start mb-6 pr-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg shadow-lg"
            whileHover={!shouldReduceMotion ? { scale: 1.05, rotate: 5 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {index + 1}
          </motion.div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              {getQuestionTypeIcon()}
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                {detail.questionType?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {detail.timeSpentSeconds !== undefined && (
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{detail.timeSpentSeconds}s</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.div
          className="text-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          <motion.div
            className="flex items-center gap-2 mb-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.4, type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {detail.marksObtained ?? 0}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              / {detail.marksAllocated}
            </span>
          </motion.div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Marks</div>
        </motion.div>
      </motion.div>

      {/* Question Text */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        <h4 className="text-gray-900 dark:text-white font-bold text-xl leading-relaxed">
          {detail.questionText}
        </h4>
      </motion.div>

      {/* Answer Section */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-inner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        <AnswerSection detail={detail} />
      </motion.div>

      {/* Correct Answer (if wrong) */}
      <AnimatePresence>
        {!isCorrect && detail.correctAnswer && (
          <motion.div
            className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-green-700 dark:text-green-400 mb-1">
                  Correct Answer
                </div>
                <div className="text-sm text-green-800 dark:text-green-300 font-medium">
                  {detail.correctAnswer}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AnswerSection({ detail }: { detail: AttemptResultDetailDTO }) {
  const shouldReduceMotion = useReducedMotion() || false;
  const { questionType, options, studentSelectedOptions, studentAnswerText, correctAnswer } = detail;

  // Helper to check if an option was selected by the student
  const isSelected = (option: string) => studentSelectedOptions?.includes(option);

  // Helper to check if an option is the correct answer (simple check for MCQ)
  // Note: For complex types, this logic might need to be more robust based on backend data format
  const isOptionCorrect = (option: string) => correctAnswer === option;

  if (questionType === 'MCQ' || questionType === 'TRUE_FALSE' || questionType === 'MULTIPLE_ANSWER') {
    return (
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
      >
        {options?.map((option, idx) => {
          const selected = isSelected(option);
          const correct = isOptionCorrect(option);

          let optionConfig = {
            className: "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50",
            icon: null as React.ReactNode,
            bgClass: "",
            ringClass: ""
          };

          if (selected && correct) {
            optionConfig = {
              className: "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-900 dark:text-green-100",
              icon: <CheckCircle className="w-5 h-5 text-green-600" />,
              bgClass: "shadow-green-500/20",
              ringClass: "ring-2 ring-green-500/50"
            };
          } else if (selected && !correct) {
            optionConfig = {
              className: "border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-900 dark:text-red-100",
              icon: <X className="w-5 h-5 text-red-600" />,
              bgClass: "shadow-red-500/20",
              ringClass: "ring-2 ring-red-500/50"
            };
          } else if (!selected && correct) {
            // Highlight missed correct answer
            optionConfig = {
              className: "border-green-500 bg-gradient-to-r from-green-50/70 to-emerald-50/70 dark:from-green-900/30 dark:to-emerald-900/30 text-green-900 dark:text-green-100 border-dashed",
              icon: <motion.div
                className="text-xs font-bold text-green-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                (Correct)
              </motion.div>,
              bgClass: "",
              ringClass: ""
            };
          }

          return (
            <motion.div
              key={idx}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
                optionConfig.className,
                optionConfig.bgClass,
                optionConfig.ringClass
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, delay: idx * 0.1 }}
              whileHover={!shouldReduceMotion ? { scale: 1.02 } : undefined}
            >
              <motion.span
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300"
                whileHover={!shouldReduceMotion ? { scale: 1.1 } : undefined}
              >
                {String.fromCharCode(65 + idx)}
              </motion.span>

              <span className="flex-1 text-gray-900 dark:text-gray-100 font-medium leading-relaxed">
                {option}
              </span>

              <AnimatePresence>
                {optionConfig.icon && (
                  <motion.div
                    className="ml-auto"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {optionConfig.icon}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  if (questionType === 'SHORT_ANSWER' || questionType === 'FILL_BLANK') {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
      >
        <div>
          <motion.span
            className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Your Answer
          </motion.span>
          <motion.div
            className={cn(
              "mt-2 p-4 rounded-xl border-2 text-sm font-medium",
              detail.isCorrect
                ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500 text-green-900 dark:text-green-100 shadow-green-500/20"
                : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-500 text-red-900 dark:text-red-100 shadow-red-500/20"
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, delay: 0.2 }}
          >
            {studentAnswerText ? (
              <span className="break-words">{studentAnswerText}</span>
            ) : (
              <span className="italic text-gray-500 dark:text-gray-400">No answer provided</span>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (questionType === 'ESSAY') {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
      >
        <div>
          <motion.span
            className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Your Answer
          </motion.span>
          <motion.div
            className="mt-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, delay: 0.2 }}
          >
            {studentAnswerText ? (
              <span className="break-words">{studentAnswerText}</span>
            ) : (
              <span className="italic text-gray-500 dark:text-gray-400">No answer provided</span>
            )}
          </motion.div>
        </div>

        {/* Essays usually don't have a single "correct answer" string to display simply,
            but if provided, we show it as model answer */}
        {correctAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Model Answer / Key Points
            </span>
            <motion.div
              className="mt-2 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-sm text-blue-900 dark:text-blue-100 font-medium"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, delay: 0.4 }}
            >
              {correctAnswer}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="text-center py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
    >
      <HelpCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
      <div className="text-gray-500 dark:text-gray-400 italic text-sm">
        Unsupported question type: {questionType}
      </div>
    </motion.div>
  );
}
