import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Option {
  id: number;
  option_text: string;
}

interface Question {
  id: number;
  question: string;
  correct_answer: string;
  options: Option[];
}

interface Quiz {
  id: number;
  title: string;
  created_by: number;
  created_at: string;
  questions: Question[];
}

const QuizTaking: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>(); // Ensure your route uses "quizId" as the parameter name.
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timer, setTimer] = useState(60); // 60-second timer for example
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!quizId) {
      setErrorMsg("Quiz ID is missing in the URL.");
      return;
    }
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`https://online-school-platform.onrender.com/api/quizzes/${quizId}`);
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        if (!data.questions || !Array.isArray(data.questions)) {
          throw new Error("Quiz data is incomplete. Questions are missing.");
        }
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(""));
      } catch (error: any) {
        console.error("Error fetching quiz:", error);
        setErrorMsg(error.message || "Error fetching quiz data.");
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (quizSubmitted || errorMsg) return;
    if (timer <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, quizSubmitted, errorMsg]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (!quiz || !quiz.questions) return;
    let calculatedScore = 0;
    quiz.questions.forEach((q, index) => {
      if (q.correct_answer === answers[index]) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setQuizSubmitted(true);
  };

  if (errorMsg) {
    return <div className="text-center mt-10 text-red-600">{errorMsg}</div>;
  }

  if (!quiz) return <div className="text-center mt-10">Loading quiz...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
      {!quizSubmitted ? (
        <>
          <div className="mb-4">
            <span className="font-medium">Time Remaining: </span>
            <span>{timer} seconds</span>
          </div>
          {quiz.questions.map((q, index) => (
            <div key={q.id} className="mb-6 p-4 border rounded-lg">
              <p className="font-medium">
                {index + 1}. {q.question}
              </p>
              <div className="mt-2 space-y-2">
                {q.options.map((option) => (
                  <label key={option.id} className="block">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option.option_text}
                      checked={answers[index] === option.option_text}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className="mr-2"
                    />
                    {option.option_text}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Quiz
          </button>
        </>
      ) : (
        <div className="p-4 border rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
          <p>
            You scored {score} out of {quiz.questions.length}
          </p>
          <div className="mt-4">
            {quiz.questions.map((q, index) => (
              <div key={q.id} className="mb-2">
                <p className="font-medium">
                  {index + 1}. {q.question}
                </p>
                <p>
                  Your answer:{" "}
                  <span className="font-semibold">{answers[index] || "No answer"}</span>
                </p>
                <p>
                  Correct answer:{" "}
                  <span className="font-semibold">{q.correct_answer}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaking;
