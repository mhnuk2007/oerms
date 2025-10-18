import RequireAuth from '../../app/components/RequireAuth';

export default function TeacherPage() {
  return (
    <RequireAuth role="TEACHER">
      <div className="max-w-6xl mx-auto py-10">
        <h1 className="text-2xl font-semibold mb-4">Teacher Dashboard</h1>
        <p>Create and manage exams assigned to your classes.</p>
      </div>
    </RequireAuth>
  );
}
