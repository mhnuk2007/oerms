export const CSV_TEMPLATE = `Question Type,Question Text,Marks,Negative Marks,Option A,Option B,Option C,Option D,Correct Options,Instructions
MCQ,What is the capital of France?,1,0.25,Paris,London,Berlin,Madrid,A,
MCQ,Which planet is known as the Red Planet?,1,0.25,Venus,Mars,Jupiter,Saturn,B,
SUBJECTIVE,Explain the process of photosynthesis.,5,,,,,,,Please include the chemical equation and main steps
MCQ,Select all programming languages from the list.,2,0.5,Python,Word,Java,Excel,AC,
SUBJECTIVE,Write a short essay on climate change.,10,,,,,,,Minimum 500 words. Include causes and effects`;

export const JSON_TEMPLATE = {
  questions: [
    {
      type: "MCQ",
      questionText: "What is the capital of France?",
      marks: 1,
      negativeMarks: 0.25,
      options: [
        { id: "a", text: "Paris" },
        { id: "b", text: "London" },
        { id: "c", text: "Berlin" },
        { id: "d", text: "Madrid" }
      ],
      correctOptionIds: ["a"]
    },
    {
      type: "MCQ",
      questionText: "Which planet is known as the Red Planet?",
      marks: 1,
      negativeMarks: 0.25,
      options: [
        { id: "a", text: "Venus" },
        { id: "b", text: "Mars" },
        { id: "c", text: "Jupiter" },
        { id: "d", text: "Saturn" }
      ],
      correctOptionIds: ["b"]
    },
    {
      type: "SUBJECTIVE",
      questionText: "Explain the process of photosynthesis.",
      marks: 5,
      instructions: "Please include the chemical equation and main steps"
    },
    {
      type: "MCQ",
      questionText: "Select all programming languages from the list.",
      marks: 2,
      negativeMarks: 0.5,
      options: [
        { id: "a", text: "Python" },
        { id: "b", text: "Word" },
        { id: "c", text: "Java" },
        { id: "d", text: "Excel" }
      ],
      correctOptionIds: ["a", "c"]
    },
    {
      type: "SUBJECTIVE",
      questionText: "Write a short essay on climate change.",
      marks: 10,
      instructions: "Minimum 500 words. Include causes and effects"
    }
  ]
};