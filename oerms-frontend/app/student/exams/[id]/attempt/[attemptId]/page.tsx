"use client";

import RequireAuth from "../../../../components/RequireAuth";
import ExamRunner from "../../../../components/ExamRunner";

export default function ExamAttemptPage({ params }: { params: { id: string; attemptId: string } }) {
  return (
    <RequireAuth role="STUDENT">
      <ExamRunner examId={params.id} attemptId={params.attemptId} />
    </RequireAuth>
  );
}