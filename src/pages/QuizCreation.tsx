import React, { useState } from "react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const QuizCreation: React.FC = () => {
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: ""
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) {
      alert("Please fill out the question and select the correct answer.");
      return;
    }
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({ question: "", options: ["", "", "", ""], correctAnswer: "" });
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle || questions.length === 0) {
      alert("Please provide a quiz title and at least one question.");
      return;
    }

    const quizData = { title: quizTitle, created_by: 1, questions }; // Replace created_by with dynamic user ID if needed

    try {
      const response = await fetch("http://localhost:5000/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizData)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create quiz");
      }
      alert("Quiz created successfully! Quiz ID: " + result.quizId);
      // Reset form after submission
      setQuizTitle("");
      setQuestions([]);
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create Quiz</h1>
      <form onSubmit={handleSubmitQuiz} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Quiz Title</label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter quiz title"
            required
          />
        </div>
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Add a Question</h2>
          <label className="block text-sm font-medium mb-1">Question</label>
          <input
            type="text"
            value={currentQuestion.question}
            onChange={(e) =>
              setCurrentQuestion({ ...currentQuestion, question: e.target.value })
            }
            className="w-full p-2 border rounded-lg mb-4"
            placeholder="Enter the question"
            required
          />
          <div>
            <p className="font-medium">Options</p>
            {currentQuestion.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...currentQuestion.options];
                  newOptions[index] = e.target.value;
                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                }}
                className="w-full p-2 border rounded-lg my-1"
                placeholder={`Option ${index + 1}`}
                required
              />
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correct Answer</label>
            <input
              type="text"
              value={currentQuestion.correctAnswer}
              onChange={(e) =>
                setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
              placeholder="Enter the correct answer"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Question
          </button>
        </div>
        {questions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">Questions Added:</h2>
            <ul className="list-disc pl-4">
              {questions.map((q, idx) => (
                <li key={idx}>
                  {q.question} (Correct: {q.correctAnswer})
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Quiz
        </button>
      </form>
    </div>
  );
};

export default QuizCreation;
