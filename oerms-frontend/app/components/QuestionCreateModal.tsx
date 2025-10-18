"use client";

import { useCallback, useState } from "react";
import api from "../../../lib/api";
import type { Question } from "../../types/exam";

interface Props {
  examId: string;
  onClose: () => void;
  onQuestionAdded?: () => void;
}

export default function QuestionCreateModal({ examId, onClose, onQuestionAdded }: Props) {
  const [type, setType] = useState<'MCQ' | 'SUBJECTIVE'>('MCQ');
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [options, setOptions] = useState([
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
    { id: 'd', text: '' }
  ]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = useCallback(() => {
    const nextId = String.fromCharCode('a'.charCodeAt(0) + options.length);
    setOptions([...options, { id: nextId, text: '' }]);
  }, [options]);

  const removeOption = useCallback((id: string) => {
    setOptions(options.filter(o => o.id !== id));
    setCorrectOptionIds(correctOptionIds.filter(cid => cid !== id));
  }, [options, correctOptionIds]);

  const updateOption = useCallback((id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  }, [options]);

  const toggleCorrectOption = useCallback((id: string) => {
    setCorrectOptionIds(
      correctOptionIds.includes(id)
        ? correctOptionIds.filter(cid => cid !== id)
        : [...correctOptionIds, id]
    );
  }, [correctOptionIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    try {
      setLoading(true);
      setError('');

      if (!questionText.trim()) {
        throw new Error('Question text is required');
      }

      if (type === 'MCQ') {
        if (options.some(o => !o.text.trim())) {
          throw new Error('All options must have text');
        }
        if (correctOptionIds.length === 0) {
          throw new Error('Select at least one correct option');
        }
      }

      const question: Partial<Question> = {
        type,
        questionText: questionText.trim(),
        marks,
        negativeMarks: negativeMarks || undefined,
      };

      if (type === 'MCQ') {
        question.options = options;
        question.correctOptionIds = correctOptionIds;
      } else {
        question.instructions = instructions.trim() || undefined;
      }

      await api.post(`/exams/${examId}/questions`, question);
      onQuestionAdded?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add Question</h2>
          <button type="button" onClick={onClose} className="text-gray-500">&times;</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Question Type</label>
            <select 
              value={type}
              onChange={e => setType(e.target.value as 'MCQ' | 'SUBJECTIVE')}
              className="w-full border rounded px-3 py-2"
            >
              <option value="MCQ">Multiple Choice</option>
              <option value="SUBJECTIVE">Subjective/Essay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Question Text</label>
            <textarea 
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="Enter your question here..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Marks</label>
              <input 
                type="number"
                value={marks}
                onChange={e => setMarks(Math.max(0, Number(e.target.value)))}
                className="w-full border rounded px-3 py-2"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Negative Marks</label>
              <input 
                type="number"
                value={negativeMarks}
                onChange={e => setNegativeMarks(Math.max(0, Number(e.target.value)))}
                className="w-full border rounded px-3 py-2"
                min="0"
              />
            </div>
          </div>

          {type === 'MCQ' ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Options</label>
                <button 
                  type="button"
                  onClick={addOption}
                  className="text-sm text-blue-600"
                >
                  + Add Option
                </button>
              </div>
              <div className="space-y-3">
                {options.map(option => (
                  <div key={option.id} className="flex gap-3 items-start">
                    <input 
                      type="checkbox"
                      checked={correctOptionIds.includes(option.id)}
                      onChange={() => toggleCorrectOption(option.id)}
                      className="mt-2.5"
                    />
                    <input 
                      value={option.text}
                      onChange={e => updateOption(option.id, e.target.value)}
                      className="flex-1 border rounded px-3 py-2"
                      placeholder={`Option ${option.id.toUpperCase()}`}
                      required
                    />
                    {options.length > 2 && (
                      <button 
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="text-red-500 px-2"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Instructions (Optional)</label>
              <textarea 
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="Enter any special instructions for the subjective question..."
              />
            </div>
          )}
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
            {loading ? 'Adding...' : 'Add Question'}
          </button>
        </div>
      </form>
    </div>
  );
}