import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllQuizzes, getAttempts, getPlatformStats } from '@/lib/data';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  FileQuestion,
  Trophy,
  AlertTriangle
} from 'lucide-react';

const AdminAnalytics = () => {
  const quizzes = getAllQuizzes().filter(q => q.isActive);
  const attempts = getAttempts();
  const stats = getPlatformStats();

  // Calculate analytics
  const quizAnalytics = quizzes.map(quiz => {
    const quizAttempts = attempts.filter(a => a.quizId === quiz.id);
    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) / quizAttempts.length)
      : 0;
    const violations = quizAttempts.reduce((acc, a) => acc + a.violations.length, 0);
    
    return {
      ...quiz,
      attempts: quizAttempts.length,
      avgScore,
      violations,
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Platform performance and insights
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Platform Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileQuestion className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalAttempts}</p>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {attempts.reduce((acc, a) => acc + a.violations.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Violations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Performance Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Quiz Performance
            </CardTitle>
            <CardDescription>Detailed breakdown of each quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quiz</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Questions</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Attempts</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Avg Score</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Violations</th>
                  </tr>
                </thead>
                <tbody>
                  {quizAnalytics.map((quiz) => (
                    <tr key={quiz.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{quiz.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">{quiz.code}</p>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 text-foreground">
                        {quiz.questions.length}
                      </td>
                      <td className="text-center py-3 px-4 text-foreground">
                        {quiz.attempts}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`font-medium ${
                          quiz.avgScore >= 70 ? 'text-success' : 
                          quiz.avgScore >= 40 ? 'text-warning' : 
                          'text-destructive'
                        }`}>
                          {quiz.avgScore}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          quiz.violations > 0 
                            ? 'bg-warning/10 text-warning' 
                            : 'bg-success/10 text-success'
                        }`}>
                          {quiz.violations}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
