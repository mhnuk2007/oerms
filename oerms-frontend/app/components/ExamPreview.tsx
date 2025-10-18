"use client";

import { useState } from "react";
import type { Exam, Question } from "../types/exam";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/errors";
import ExamTimer from "./ExamTimer";

interface Props {
  exam: Exam;
  questions: Question[];
  onClose: () => void;
}

export default function ExamPreview({ exam, questions, onClose }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col z-50">
      <div className="bg-white border-b sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{exam.title}</h2>
            <p className="text-sm text-gray-600 mt-1">Preview Mode</p>
          </div>
          <div className="flex items-center gap-4">
            <ExamTimer seconds={exam.durationSeconds} onExpire={() => {}} />
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 rounded-md text-sm"
            >
              Exit Preview
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {questions.length === 0 ? (
            <div className="text-center text-gray-600">No questions added yet.</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <div className="text-sm text-gray-600">
                  Marks: {questions[currentQuestion].marks}
                  {questions[currentQuestion].negativeMarks ? (
                    <span className="text-red-600 ml-2">
                      (Negative: -{questions[currentQuestion].negativeMarks})
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <div className="font-medium mb-6">
                  {questions[currentQuestion].questionText}
                </div>

                {questions[currentQuestion].type === "MCQ" ? (
                  <div className="space-y-3">
                    {questions[currentQuestion].options?.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-start gap-3 p-3 border rounded-lg ${
                          showAnswers &&
                          questions[currentQuestion].correctOptionIds?.includes(
                            option.id
                          )
                            ? "border-green-500 bg-green-50"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled
                          checked={
                            showAnswers &&
                            questions[currentQuestion].correctOptionIds?.includes(
                              option.id
                            )
                          }
                          className="mt-1"
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    <textarea
                      className="w-full h-32 border rounded-lg p-3 bg-gray-50"
                      placeholder="[Student answer will appear here]"
                      disabled
                    />
                    {questions[currentQuestion].instructions && (
                      <div className="mt-3 text-sm text-gray-600 italic">
                        Instructions: {questions[currentQuestion].instructions}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: questions.length }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={`w-8 h-8 rounded-full ${
                        i === currentQuestion
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={currentQuestion === questions.length - 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}