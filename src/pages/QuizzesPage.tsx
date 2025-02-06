import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Book, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Option {
  id: number;
  option_text: string;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
  correct_answer: string;
}

interface Quiz {
  id: number;
  title: string;
  questions: Question[];
}

interface SelectedAnswers {
  [key: number]: string;
}

interface ProgressData {
  question: string;
  progress: number;
}

interface PieData {
  name: string;
  value: number;
}

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes")
      .then((res) => res.json())
      .then((data: Quiz[]) => {
        const filteredQuizzes = data.filter((quiz) => quiz.id === 1 || quiz.id === 2 || quiz.id === 3);
        setQuizzes(filteredQuizzes);
      });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, timeLeft]);

  const startQuiz = (quiz: Quiz) => {
    const questions = quiz.questions.sort(() => 0.5 - Math.random()).slice(0, 10);
    setSelectedQuiz(quiz);
    setRandomQuestions(questions);
    setScore(0);
    setSelectedAnswers({});
    setTimeLeft(600); // 10 minutes
    setQuizStarted(true);
    setShowResults(false);
    setAnsweredQuestions([]);
  };

  const handleAnswer = (questionId: number, selectedOption: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    if (!answeredQuestions.includes(questionId)) {
      setAnsweredQuestions((prev) => [...prev, questionId]);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    const questionResults = randomQuestions.map(q => {
      const isCorrect = selectedAnswers[q.id] === q.correct_answer;
      if (isCorrect) correctCount++;
      return {
        question: q.question,
        isCorrect,
      };
    });
    setScore(correctCount);
    setQuizStarted(false);
    setShowResults(true);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressData = (): ProgressData[] => {
    return Array.from({ length: 10 }, (_, i) => ({
      question: `Q${i + 1}`,
      progress: (answeredQuestions.length / 10) * 100,
    }));
  };

  const getPieData = (): PieData[] => {
    if (!showResults) return [];
    return [
      { name: 'Correct', value: score },
      { name: 'Incorrect', value: 10 - score },
    ];
  };

  const COLORS = ['#4CAF50', '#f44336'];

  // Rest of the JSX remains the same, but now with proper type safety
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {selectedQuiz ? selectedQuiz.title : "Interactive Quiz Challenge"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedQuiz ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {quizzes.map((quiz) => (
                <motion.button
                  key={quiz.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => startQuiz(quiz)}
                >
                  <Book className="w-8 h-8 mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
                  <p className="text-gray-600">10 Questions • 10 Minutes</p>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <div className="space-y-6">
              {quizStarted && (
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-5 h-5 text-blue-600" />
                    <span className="text-lg font-semibold">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    <span className="text-lg font-semibold">
                      Progress: {answeredQuestions.length}/10
                    </span>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {!showResults ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {randomQuestions.map((q, index) => (
                      <motion.div
                        key={q.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                      >
                        <h3 className="text-lg font-semibold mb-4">
                          Question {index + 1}: {q.question}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((option) => (
                            <motion.button
                              key={option.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-lg transition-all duration-300 ${
                                selectedAnswers[q.id] === option.option_text
                                  ? 'bg-blue-100 border-2 border-blue-500'
                                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                              }`}
                              onClick={() => handleAnswer(q.id, option.option_text)}
                            >
                              {option.option_text}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={calculateScore}
                      disabled={answeredQuestions.length < 10}
                    >
                      Submit Quiz
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
                      <p className="text-lg">
                        Your score: {score}/10 
                        {score >= 8 ? (
                          <span className="text-green-500 ml-2">✨ Excellent!</span>
                        ) : score >= 6 ? (
                          <span className="text-yellow-500 ml-2">📚 Keep Learning!</span>
                        ) : (
                          <span className="text-red-500 ml-2">💪 Try Again!</span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64 bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Score Distribution</h3>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={getPieData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getPieData().map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="h-64 bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Progress Timeline</h3>
                        <ResponsiveContainer>
                          <LineChart data={getProgressData()}>
                            <XAxis dataKey="question" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="progress"
                              stroke="#3b82f6"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => setSelectedQuiz(null)}
                    >
                      Try Another Quiz
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizzesPage;