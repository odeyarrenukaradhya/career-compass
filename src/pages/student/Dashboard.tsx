import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getQuizzes, getAttemptsByStudent } from '@/lib/data';
import { Link } from 'react-router-dom';
import { 
  FileQuestion, 
  Trophy, 
  Target, 
  ArrowRight,
  Clock,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const quizzes = getQuizzes();
  const myAttempts = getAttemptsByStudent(user?.id || '');

  const availableQuizzes = quizzes.filter(
    q => !myAttempts.some(a => a.quizId === q.id)
  );

  const stats = [
    {
      label: 'Quizzes Attempted',
      value: myAttempts.length,
      icon: <FileQuestion className="w-5 h-5" />,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Average Score',
      value: myAttempts.length > 0 
        ? `${Math.round(myAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) / myAttempts.length)}%`
        : 'N/A',
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Available Quizzes',
      value: availableQuizzes.length,
      icon: <Target className="w-5 h-5" />,
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student').split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to enhance your skills today?
            </p>
          </div>
          <Button asChild>
            <Link to="/student/quizzes">
              Browse Quizzes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
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

        {/* Available Quizzes */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Available Quizzes</CardTitle>
              <CardDescription>Start a new assessment to test your skills</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/student/quizzes">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {availableQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">You've completed all available quizzes!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableQuizzes.slice(0, 3).map((quiz) => (
                  <div 
                    key={quiz.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{quiz.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <FileQuestion className="w-3 h-3" />
                            {quiz.questions.length} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {quiz.duration} mins
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/student/quiz/${quiz.code}`}>Start</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        {myAttempts.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
              <CardDescription>Your latest quiz performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myAttempts.slice(0, 3).map((attempt) => {
                  const quiz = quizzes.find(q => q.id === attempt.quizId);
                  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  
                  return (
                    <div 
                      key={attempt.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          percentage >= 70 ? 'bg-success/10 text-success' : 
                          percentage >= 40 ? 'bg-warning/10 text-warning' : 
                          'bg-destructive/10 text-destructive'
                        }`}>
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{quiz?.title || 'Quiz'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {attempt.score}/{attempt.totalQuestions} correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          percentage >= 70 ? 'text-success' : 
                          percentage >= 40 ? 'text-warning' : 
                          'text-destructive'
                        }`}>
                          {percentage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
