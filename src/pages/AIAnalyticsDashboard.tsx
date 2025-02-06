import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, Clock, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface PerformanceData {
  date: string;
  score: number;
  timeSpent: number;
  lessonId: string;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  answers: {
    questionId: string;
    correct: boolean;
    answer: string;
    explanation?: string;
  }[];
  timestamp: Date;
}

interface EngagementMetric {
  metric: string;
  value: number;
  trend: number;
  status: 'positive' | 'negative' | 'neutral';
}

interface AIFeedback {
  type: 'strength' | 'improvement' | 'suggestion';
  topic: string;
  message: string;
  priority: number;
}

interface AIAnalyticsDashboardProps {
  userId: string;
  performanceData: PerformanceData[];
  quizAttempts: QuizAttempt[];
  engagementMetrics: EngagementMetric[];
  aiFeedback: AIFeedback[];
}

const AIAnalyticsDashboard = ({
  userId,
  performanceData,
  quizAttempts,
  engagementMetrics,
  aiFeedback,
}: AIAnalyticsDashboardProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    // Process performance data based on selected time range
    const now = new Date();
    const filtered = performanceData.filter(data => {
      const date = new Date(data.date);
      if (selectedTimeRange === 'week') {
        return now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
      }
      if (selectedTimeRange === 'month') {
        return now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });

    setTrendData(filtered);
  }, [performanceData, selectedTimeRange]);

  const MetricCard = ({ metric }: { metric: EngagementMetric }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{metric.metric}</p>
            <p className="text-2xl font-bold mt-1">{metric.value}</p>
          </div>
          <Badge
            variant={metric.status === 'positive' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            <TrendingUp className="h-4 w-4" />
            {metric.trend}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const FeedbackCard = ({ feedback }: { feedback: AIFeedback }) => {
    const icons = {
      strength: CheckCircle,
      improvement: AlertCircle,
      suggestion: Target,
    };
    const Icon = icons[feedback.type];

    return (
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className={`p-2 rounded-lg ${
              feedback.type === 'strength' ? 'bg-green-100 text-green-700' :
              feedback.type === 'improvement' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium">{feedback.topic}</h4>
              <p className="text-sm text-gray-600 mt-1">{feedback.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 text-white">
            <Brain className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">AI Learning Assistant</h2>
              <p className="opacity-90">Your personalized feedback and analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {engagementMetrics.map((metric) => (
          <MetricCard key={metric.metric} metric={metric} />
        ))}
      </div>

      <Tabs defaultValue="progress">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress Trends</TabsTrigger>
          <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8884d8" 
                      name="Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="timeSpent" 
                      stroke="#82ca9d" 
                      name="Time (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <div className="space-y-4">
            {aiFeedback
              .sort((a, b) => b.priority - a.priority)
              .map((feedback, index) => (
                <FeedbackCard key={index} feedback={feedback} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {quizAttempts.map((attempt) => (
                  <div key={attempt.id} className="border-b pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Quiz {attempt.quizId}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(attempt.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{(attempt.score * 100).toFixed(0)}%</Badge>
                    </div>
                    <div className="space-y-2">
                      {attempt.answers.map((answer, i) => (
                        <div key={i} className="text-sm">
                          <div className="flex items-center gap-2">
                            {answer.correct ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>Question {answer.questionId}</span>
                          </div>
                          {!answer.correct && answer.explanation && (
                            <p className="text-gray-600 ml-6 mt-1">
                              {answer.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalyticsDashboard;