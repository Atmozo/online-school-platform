import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Star, Trophy, Zap } from 'lucide-react';

// Custom Progress component since we can't rely on shadcn/ui Progress
const Progress = ({ value = 0, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-full rounded-full transition-all duration-300"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

interface UserProgress {
  topicId: string;
  completed: number;
  totalTime: number;
  score: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  prerequisites: string[];
  estimatedHours: number;
}

interface UserStats {
  preferredTopics: string[];
  averageScore: number;
  completionRate: number;
  learningPace: 'slow' | 'medium' | 'fast';
  strengths: string[];
  weaknesses: string[];
}

interface RecommendationEngineProps {
  userProgress: UserProgress[];
  availableCourses: Course[];
  currentCourseId: string;
  onCourseSelect: (courseId: string) => void;
}

const RecommendationEngine = ({
  userProgress,
  availableCourses,
  currentCourseId,
  onCourseSelect,
}: RecommendationEngineProps) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Analyze user activity and generate stats
  useEffect(() => {
    const stats = analyzeUserProgress(userProgress);
    setUserStats(stats);
    setDifficultyLevel(calculateDifficultyLevel(stats));
    const recommendedCourses = generateRecommendations(stats, availableCourses, currentCourseId);
    setRecommendations(recommendedCourses);
  }, [userProgress, availableCourses, currentCourseId]);

  const analyzeUserProgress = (progress: UserProgress[]): UserStats => {
    if (!progress.length) {
      return {
        preferredTopics: [],
        averageScore: 0,
        completionRate: 0,
        learningPace: 'medium',
        strengths: [],
        weaknesses: [],
      };
    }

    const totalScores = progress.reduce((sum, p) => sum + p.score, 0);
    const averageScore = totalScores / progress.length;
    
    const topics = progress.map(p => p.topicId);
    const topicScores = topics.reduce((acc, topic) => {
      const scores = progress
        .filter(p => p.topicId === topic)
        .map(p => p.score);
      acc[topic] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return acc;
    }, {} as Record<string, number>);

    const strengths = Object.entries(topicScores)
      .filter(([_, score]) => score >= 80)
      .map(([topic]) => topic);

    const weaknesses = Object.entries(topicScores)
      .filter(([_, score]) => score <= 60)
      .map(([topic]) => topic);

    const completionRate = progress.reduce((sum, p) => sum + p.completed, 0) / progress.length;
    
    const averageTimePerTopic = progress.reduce((sum, p) => sum + p.totalTime, 0) / progress.length;
    const learningPace = averageTimePerTopic < 30 ? 'fast' : averageTimePerTopic > 60 ? 'slow' : 'medium';

    return {
      preferredTopics: strengths,
      averageScore,
      completionRate,
      learningPace,
      strengths,
      weaknesses,
    };
  };

  const calculateDifficultyLevel = (stats: UserStats): 'beginner' | 'intermediate' | 'advanced' => {
    if (stats.averageScore >= 85 && stats.completionRate >= 0.8) return 'advanced';
    if (stats.averageScore >= 70 && stats.completionRate >= 0.6) return 'intermediate';
    return 'beginner';
  };

  const generateRecommendations = (
    stats: UserStats,
    courses: Course[],
    currentCourse: string
  ): Course[] => {
    return courses
      .filter(course => course.id !== currentCourse)
      .filter(course => {
        // Filter out courses that are too easy or too hard
        if (difficultyLevel === 'beginner' && course.difficulty === 'advanced') return false;
        if (difficultyLevel === 'advanced' && course.difficulty === 'beginner') return false;
        
        // Check if user has necessary prerequisites
        const hasPrerequisites = course.prerequisites.every(
          prereq => stats.strengths.includes(prereq)
        );
        
        return hasPrerequisites;
      })
      .sort((a, b) => {
        // Score courses based on user preferences and needs
        const scoreA = calculateCourseScore(a, stats);
        const scoreB = calculateCourseScore(b, stats);
        return scoreB - scoreA;
      })
      .slice(0, 3); // Return top 3 recommendations
  };

  const calculateCourseScore = (course: Course, stats: UserStats): number => {
    let score = 0;
    
    // Higher score for courses that cover weak topics
    score += course.topics.filter(topic => 
      stats.weaknesses.includes(topic)
    ).length * 2;
    
    // Bonus for matching difficulty level
    if (course.difficulty === difficultyLevel) score += 3;
    
    // Bonus for preferred topics
    score += course.topics.filter(topic =>
      stats.preferredTopics.includes(topic)
    ).length;
    
    return score;
  };

  const DifficultyBadge = ({ level }: { level: string }) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[level as keyof typeof colors]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Personalized Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userStats && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Your Learning Profile</h3>
            <div className="grid gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Average Score</span>
                  <span className="font-medium">{userStats.averageScore.toFixed(1)}%</span>
                </div>
                <Progress value={userStats.averageScore} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="flex gap-1">
                  <Trophy className="h-4 w-4" />
                  {difficultyLevel} level
                </Badge>
                <Badge variant="outline" className="flex gap-1">
                  <Star className="h-4 w-4" />
                  {userStats.learningPace} pace
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recommended Courses</h3>
          {recommendations.length > 0 ? (
            recommendations.map(course => (
              <Card
                key={course.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onCourseSelect(course.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{course.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                    <div className="flex gap-2 mt-2">
                      <DifficultyBadge level={course.difficulty} />
                      <Badge variant="outline">{course.estimatedHours}h</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No recommendations available yet. Complete more courses to get personalized suggestions.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;