"use client";

import { useState } from 'react';
import RequireAuth from '../../components/RequireAuth';
import ExamList from '../../components/ExamList';
import ExamCreateModal from '../../components/ExamCreateModal';
import ExamUploadModal from '../../components/ExamUploadModal';

export default function AdminDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  return (
    <RequireAuth role="ADMIN">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage exams, questions, and results</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Create Exam
            </button>
          </div>
        </div>

        <ExamList
          onUpdate={() => {
            // Refresh data when needed
          }}
        />

        {showCreate && (
          <ExamCreateModal
            onClose={() => setShowCreate(false)}
            onExamCreated={() => {
              setShowCreate(false);
              // Refresh data when needed
            }}
          />
        )}

        {selectedExam && (
          <ExamUploadModal
            examId={selectedExam}
            onClose={() => setSelectedExam(null)}
            onQuestionsUploaded={() => {
              setSelectedExam(null);
              // Refresh data when needed
            }}
          />
        )}
      </div>
    </RequireAuth>
  );
}
