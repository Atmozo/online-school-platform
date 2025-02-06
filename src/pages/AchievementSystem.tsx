import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Award, Crown, Zap, Target } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'medal' | 'star' | 'award' | 'crown' | 'zap' | 'target';
  progress: number;
  total: number;
  unlockedAt?: Date;
  type: 'course' | 'skill' | 'engagement' | 'special';
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  achievements: number;
  lastActive: Date;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  completedAt: Date;
  type: 'achievement' | 'course' | 'skill';
}

interface AchievementSystemProps {
  userId: string;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  milestones: Milestone[];
  onAchievementClick?: (achievementId: string) => void;
}

const AchievementSystem = ({
  userId,
  achievements,
  leaderboard,
  milestones,
  onAchievementClick
}: AchievementSystemProps) => {
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [recentMilestones, setRecentMilestones] = useState<Milestone[]>([]);
  
  useEffect(() => {
    const userRankData = leaderboard.find(entry => entry.userId === userId) || null;
    setUserRank(userRankData);
    
    // Get milestones from the last 7 days
    const recent = milestones.filter(
      m => new Date().getTime() - new Date(m.completedAt).getTime() < 7 * 24 * 60 * 60 * 1000
    );
    setRecentMilestones(recent);
  }, [userId, leaderboard, milestones]);

  const IconComponent = ({ type }: { type: Achievement['icon'] }) => {
    const icons = {
      trophy: Trophy,
      medal: Medal,
      star: Star,
      award: Award,
      crown: Crown,
      zap: Zap,
      target: Target
    };
    const Icon = icons[type];
    return <Icon className="h-6 w-6" />;
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const isUnlocked = achievement.progress >= achievement.total;
    const progressPercent = (achievement.progress / achievement.total) * 100;

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          isUnlocked ? 'bg-green-50' : 'bg-gray-50'
        }`}
        onClick={() => onAchievementClick?.(achievement.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${
              isUnlocked ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
            }`}>
              <IconComponent type={achievement.icon} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{achievement.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">
                    {achievement.progress} / {achievement.total}
                  </span>
                  {isUnlocked && (
                    <span className="text-sm text-green-600">
                      Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LeaderboardTable = () => (
    <div className="space-y-4">
      {leaderboard.map((entry, index) => (
        <div
          key={entry.userId}
          className={`flex items-center p-4 rounded-lg ${
            entry.userId === userId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
          }`}
        >
          <div className="flex-none w-8 font-bold text-lg">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="font-medium">{entry.username}</div>
            <div className="text-sm text-gray-600">
              {entry.achievements} achievements
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{entry.score} pts</Badge>
            {index < 3 && (
              <Trophy className={`h-5 w-5 ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                'text-amber-600'
              }`} />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const MilestoneList = () => (
    <div className="space-y-4">
      {recentMilestones.map((milestone) => (
        <Card key={milestone.id} className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h4 className="font-medium">{milestone.title}</h4>
                <p className="text-sm text-gray-600">{milestone.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Achieved {new Date(milestone.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {userRank && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Rank #{userRank.rank}</h3>
                <p className="opacity-90">{userRank.score} points • {userRank.achievements} achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="achievements">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="milestones">Recent Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="mt-6 space-y-4">
          {achievements.map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <LeaderboardTable />
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <MilestoneList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementSystem;