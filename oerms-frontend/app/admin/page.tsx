import RequireAuth from '../../app/components/RequireAuth';

export default function AdminPage() {
  return (
    <RequireAuth role="ADMIN">
      <div className="max-w-6xl mx-auto py-10">
        <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
        <p>Manage exams, questions, users, and notifications.</p>
      </div>
    </RequireAuth>
  );
}
