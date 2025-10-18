import { useState } from "react";
import api from "../../lib/api";
import type { Exam } from "../types/exam";

interface Props {
  onClose: () => void;
  onExamCreated?: () => void;
}

export default function ExamCreateModal({ onClose, onExamCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allowedAttempts, setAllowedAttempts] = useState(1);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [settings, setSettings] = useState({
    shuffleQuestions: false,
    showAnswersAfterSubmit: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const exam: Partial<Exam> = {
        title: title.trim(),
        description: description.trim() || undefined,
        durationSeconds: duration * 60,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        allowedAttempts,
        visibility,
        status: 'DRAFT',
        settings
      };

      await api.post("/exams", exam);
      onExamCreated?.();
      onClose();
    } catch (err) {
      setError("Failed to create exam");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleCreate} className="bg-white rounded-xl p-8 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Create New Exam</h2>
          <button type="button" onClick={onClose} className="text-gray-500">&times;</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              placeholder="Enter exam title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="Enter exam description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(Math.max(1, Number(e.target.value)))}
                className="w-full border rounded px-3 py-2"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Allowed Attempts</label>
              <input
                type="number"
                value={allowedAttempts}
                onChange={e => setAllowedAttempts(Math.max(1, Number(e.target.value)))}
                className="w-full border rounded px-3 py-2"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time (Optional)</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time (Optional)</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
              className="w-full border rounded px-3 py-2"
            >
              <option value="PRIVATE">Private (Only visible to selected students)</option>
              <option value="PUBLIC">Public (Visible to all students)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Settings</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.shuffleQuestions}
                  onChange={e => setSettings({ ...settings, shuffleQuestions: e.target.checked })}
                />
                Shuffle Questions
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.showAnswersAfterSubmit}
                  onChange={e => setSettings({ ...settings, showAnswersAfterSubmit: e.target.checked })}
                />
                Show Answers After Submit
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600 font-medium">{error}</div>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </form>
    </div>
  );
}
