import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  Star,
  Timer,
  BookOpen,
  CheckCircle2,
  Target,
  Award,
} from "lucide-react";

interface Achievement {
  id: number;
  achievement: {
    id: number;
    name: string;
    description: string;
    icon: string;
    type: string;
    requiredValue: number;
  };
  unlockedAt: string;
  progress: number;
}

interface Reward {
  id: number;
  reward: {
    id: number;
    name: string;
    description: string;
    type: string;
  };
  earnedAt: string;
  status: "active" | "expired" | "consumed";
}

interface Engagement {
  loginStreak: number;
  totalTimeSpent: number;
  completedLessons: number;
  questionsAnswered: number;
  correctAnswers: number;
  participationScore: number;
  lastUpdated: string;
}

export default function EngagementPage() {
  const { data: engagement } = useQuery<Engagement>({
    queryKey: ["/api/student/engagement"],
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/student/achievements"],
  });

  const { data: rewards = [] } = useQuery<Reward[]>({
    queryKey: ["/api/student/rewards"],
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "login_streak":
        return <Timer className="h-5 w-5" />;
      case "completion":
        return <BookOpen className="h-5 w-5" />;
      case "grade":
        return <Target className="h-5 w-5" />;
      case "participation":
        return <Star className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Engagement</h1>

      {/* Engagement Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Streak</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement?.loginStreak || 0} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((engagement?.totalTimeSpent || 0) / 60)}h {(engagement?.totalTimeSpent || 0) % 60}m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagement?.questionsAnswered
                ? Math.round((engagement.correctAnswers / engagement.questionsAnswered) * 100)
                : 0}%
            </div>
            <Progress 
              value={engagement?.questionsAnswered
                ? (engagement.correctAnswers / engagement.questionsAnswered) * 100
                : 0
              } 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(engagement?.participationScore || 0)}</div>
            <Progress value={engagement?.participationScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Achievements
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map(({ achievement, unlockedAt, progress }) => (
            <Card key={achievement.id} className="relative overflow-hidden">
              {unlockedAt && (
                <div className="absolute top-2 right-2">
                  <Badge variant="success">Unlocked!</Badge>
                </div>
              )}
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  {getTypeIcon(achievement.type)}
                </div>
                <div>
                  <CardTitle className="text-base">{achievement.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </CardHeader>
              <CardContent>
                <Progress
                  value={(progress / achievement.requiredValue) * 100}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Progress: {progress} / {achievement.requiredValue}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rewards Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Medal className="h-6 w-6" />
          Rewards
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map(({ reward, earnedAt, status }) => (
            <Card key={reward.id}>
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{reward.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Earned: {new Date(earnedAt).toLocaleDateString()}
                  </p>
                  <Badge variant={status === "active" ? "success" : "secondary"}>
                    {status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
