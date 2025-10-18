import { useState } from "react";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/errors";

interface Props {
  examId: string;
  onClose: () => void;
  onQuestionsUploaded?: () => void;
}

export default function ExamUploadModal({ examId, onClose, onQuestionsUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ questionCount: number; totalMarks: number } | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await api.post(`/exams/${examId}/questions/preview`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPreview(res.data);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to preview questions");
      setError(message);
      setFile(null);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Please select a file");
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/exams/${examId}/questions/bulk`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onQuestionsUploaded?.();
      onClose();
    } catch (err) {
      const message = getErrorMessage(err, "Failed to upload questions");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleUpload} className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Bulk Upload Questions</h2>
          <button type="button" onClick={onClose} className="text-gray-500">&times;</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Upload File</label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Accepts CSV or JSON files. Download template{" "}
              <button type="button" className="text-blue-600 hover:underline" onClick={() => {/* TODO: Add template download */}}>
                here
              </button>
            </p>
          </div>

          {preview && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Questions:</span>{" "}
                  <span className="font-medium">{preview.questionCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Marks:</span>{" "}
                  <span className="font-medium">{preview.totalMarks}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 font-medium">{error}</div>
          )}
        </div>

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
            disabled={loading || !file}
          >
            {loading ? 'Uploading...' : 'Upload Questions'}
          </button>
        </div>
      </form>
    </div>
  );
}
