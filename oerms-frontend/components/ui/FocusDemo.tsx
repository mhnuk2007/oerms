import React from 'react';
import { Button } from './Button';

export default function FocusDemo() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Focus Indicator Demo</h2>

      <p className="text-sm text-gray-600 mb-6">Use Tab to move focus between elements and see the visible focus rings.</p>

      <div className="flex flex-col gap-4 max-w-lg">
        <div className="flex gap-4 items-center">
          <Button variant="primary">Primary Button</Button>
          <Button variant="outline">Outline</Button>
          <a href="#" className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">Link</a>
        </div>

        <div className="flex gap-4 items-center">
          <input className="p-2 border rounded focus-visible:outline-2 focus-visible:outline-offset-2" placeholder="Text input" />
          <textarea className="p-2 border rounded focus-visible:outline-2 focus-visible:outline-offset-2" placeholder="Textarea" />
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Question palette sample</p>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                type="button"
                className="aspect-square rounded-md flex items-center justify-center text-sm font-medium border bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
