// components/admin/bulk-question-importer.tsx - Bulk Question Import Component
'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useBulkQuestionImport } from '@/lib/hooks/use-bulk-operations';
import { Loading } from '@/components/common/loading';
import type { CreateQuestionRequest } from '@/lib/types';

interface BulkQuestionImporterProps {
  examId: string;
  onImportComplete?: (results: any) => void;
}

export function BulkQuestionImporter({ examId, onImportComplete }: BulkQuestionImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CreateQuestionRequest[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { importQuestions, isImporting, progress, result, clearResult } = useBulkQuestionImport(examId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    parseCSVFile(file);
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          alert('CSV file must have at least a header row and one data row');
          return;
        }

        // Parse header to understand column structure
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Expected columns
        const expectedHeaders = ['question_text', 'type', 'marks', 'options', 'correct_answer', 'explanation', 'difficulty'];

        // Map CSV columns to question structure
        const questions: CreateQuestionRequest[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());

          if (values.length < 3) continue; // Skip incomplete rows

          const question: CreateQuestionRequest = {
            examId,
            questionText: values[0] || '',
            type: (values[1] as 'MCQ' | 'MULTIPLE_ANSWER' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY') || 'MCQ',
            marks: parseInt(values[2]) || 1,
            correctAnswer: values[4] || '',
            explanation: values[5] || undefined,
            difficultyLevel: (values[6] as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM'
          };

          // Handle options for MCQ types
          if ((question.type === 'MCQ' || question.type === 'MULTIPLE_ANSWER') && values[3]) {
            try {
              // Try to parse as JSON array first, then fallback to comma-separated
              question.options = JSON.parse(values[3]);
            } catch {
              question.options = values[3].split(';').map(opt => opt.trim()).filter(opt => opt);
            }
          }

          questions.push(question);
        }

        setPreviewData(questions);
        setShowPreview(true);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    try {
      const results = await importQuestions(previewData);
      onImportComplete?.(results);

      // Reset state
      setSelectedFile(null);
      setPreviewData([]);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    }
  };

  const downloadTemplate = () => {
    const csvContent = `question_text,type,marks,options,correct_answer,explanation,difficulty
"What is 2 + 2?",MCQ,1,"[""4"",""3"",""5"",""6""]","4","Basic arithmetic","EASY"
"Explain photosynthesis",ESSAY,5,,,,"MEDIUM"
"Water boils at 100°C",TRUE_FALSE,1,,true,"Basic science fact","EASY"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showPreview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Preview Import Data ({previewData.length} questions)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Question</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Marks</th>
                  <th className="px-3 py-2 text-left">Answer</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((question, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{question.questionText}</td>
                    <td className="px-3 py-2">{question.type}</td>
                    <td className="px-3 py-2">{question.marks}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{question.correctAnswer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <div className="px-3 py-2 text-sm text-gray-500 border-t">
                ... and {previewData.length - 10} more questions
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Importing...' : `Import ${previewData.length} Questions`}
            </Button>
            <Button variant="secondary" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Import Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Question Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">CSV Format Requirements:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• question_text (required)</li>
                <li>• type: MCQ, MULTIPLE_ANSWER, TRUE_FALSE, SHORT_ANSWER, ESSAY</li>
                <li>• marks: number (default: 1)</li>
                <li>• options: JSON array for MCQ types</li>
                <li>• correct_answer (required)</li>
                <li>• explanation (optional)</li>
                <li>• difficulty: EASY, MEDIUM, HARD</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Example:</h3>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`"What is 2 + 2?",MCQ,1,"[""4"",""3"",""5"",""6""]","4","Basic math","EASY"
"Explain gravity",ESSAY,5,,,"Scientific concept","MEDIUM"`}
              </pre>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={downloadTemplate} variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={!examId}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select CSV File
              </Button>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Progress */}
      {isImporting && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Importing Questions...</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.successCount > 0 && <CheckCircle className="w-5 h-5 text-green-600" />}
              {result.failureCount > 0 && <AlertCircle className="w-5 h-5 text-yellow-600" />}
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.successCount}</div>
                <div className="text-sm text-green-700">Successful</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.failureCount}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
            </div>

            {result.failed.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-700">Failed Imports:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {result.failed.slice(0, 5).map((failure, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-red-900">
                          {failure.data.questionText?.slice(0, 50)}...
                        </div>
                        <div className="text-sm text-red-700">{failure.error}</div>
                      </div>
                    </div>
                  ))}
                  {result.failed.length > 5 && (
                    <div className="text-sm text-gray-600 text-center py-2">
                      ... and {result.failed.length - 5} more failures
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button onClick={clearResult} variant="secondary" className="w-full">
              Clear Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
