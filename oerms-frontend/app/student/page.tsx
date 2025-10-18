import RequireAuth from '../../app/components/RequireAuth';

export default function StudentPage() {
  return (
    <RequireAuth role="STUDENT">
      <div className="max-w-6xl mx-auto py-10">
        <h1 className="text-2xl font-semibold mb-4">Student Dashboard</h1>
        <p>Take exams and view your results.</p>
      </div>
    </RequireAuth>
  );
}
