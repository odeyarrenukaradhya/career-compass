import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getAllQuizzes, getAttempts, getPlatformStats } from '@/lib/data';
import { Link } from 'react-router-dom';
import { 
  FileQuestion, 
  Users,
  BarChart3,
  PlusCircle,
  Clock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const quizzes = getAllQuizzes();
  const attempts = getAttempts();
  const stats = getPlatformStats();

  // Get recent attempts with violations
  const recentViolations = attempts
    .filter(a => a.violations.length > 0)
    .slice(-5)
    .reverse();

  const dashboardStats = [
    {
      label: 'Total Quizzes',
      value: stats.totalQuizzes,
      icon: <FileQuestion className="w-5 h-5" />,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Attempts',
      value: stats.totalAttempts,
      icon: <Users className="w-5 h-5" />,
      color: 'text-admin',
      bg: 'bg-admin/10',
    },
    {
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Active Students',
      value: stats.totalStudents,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              TPO Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage quizzes and monitor student performance
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/quizzes/create">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Quiz
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Quizzes */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Quizzes</CardTitle>
                <CardDescription>Latest assessments created</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/quizzes">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quizzes.slice(0, 4).map((quiz) => {
                  const quizAttempts = attempts.filter(a => a.quizId === quiz.id);
                  
                  return (
                    <div 
                      key={quiz.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileQuestion className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">{quiz.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{quiz.questions.length} questions</span>
                            <span>•</span>
                            <span>{quizAttempts.length} attempts</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {quiz.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Alerts */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Monitoring Alerts
              </CardTitle>
              <CardDescription>Recent integrity violations detected</CardDescription>
            </CardHeader>
            <CardContent>
              {recentViolations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground">No violations detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentViolations.map((attempt) => (
                    <div 
                      key={attempt.id}
                      className="p-3 rounded-lg bg-warning/5 border border-warning/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground text-sm">
                          {attempt.studentName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {attempt.violations.length} violation(s)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {attempt.violations.slice(0, 3).map((v, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning"
                          >
                            {v.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
