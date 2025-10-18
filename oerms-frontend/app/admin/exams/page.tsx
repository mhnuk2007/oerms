"use client";
import { useState } from "react";
import ExamList from "../../components/ExamList";
import ExamCreateModal from "../../components/ExamCreateModal";
import ExamUploadModal from "../../components/ExamUploadModal";

export default function AdminExamsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Exam Management</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={() => setShowCreate(true)}>Create Exam</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md" onClick={() => setShowUpload(true)}>Bulk Upload Questions</button>
        </div>
      </div>
      <ExamList />
      {showCreate && <ExamCreateModal onClose={() => setShowCreate(false)} />}
      {showUpload && <ExamUploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}
