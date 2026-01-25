import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getAttemptsByStudent, getQuizById } from '@/lib/data';
import { 
  Trophy, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';

const StudentResults = () => {
  const { user } = useAuth();
  const myAttempts = getAttemptsByStudent(user?.id || '');

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Results</h1>
          <p className="text-muted-foreground mt-1">
            View your quiz performance and progress
          </p>
        </div>

        {myAttempts.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="pt-12 pb-12 text-center">
              <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Results Yet</h3>
              <p className="text-muted-foreground">
                Complete a quiz to see your results here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myAttempts.map((attempt) => {
              const quiz = getQuizById(attempt.quizId);
              const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
              const submittedAt = new Date(attempt.submittedAt);
              
              return (
                <Card key={attempt.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{quiz?.title || 'Quiz'}</CardTitle>
                        <CardDescription>
                          Completed on {submittedAt.toLocaleDateString()} at {submittedAt.toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <div className={`px-4 py-2 rounded-lg text-center ${
                        percentage >= 70 ? 'bg-success/10' : 
                        percentage >= 40 ? 'bg-warning/10' : 
                        'bg-destructive/10'
                      }`}>
                        <p className={`text-2xl font-bold ${
                          percentage >= 70 ? 'text-success' : 
                          percentage >= 40 ? 'text-warning' : 
                          'text-destructive'
                        }`}>
                          {percentage}%
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Score
                        </div>
                        <p className="font-semibold text-foreground">
                          {attempt.score}/{attempt.totalQuestions}
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <FileQuestion className="w-4 h-4" />
                          Questions
                        </div>
                        <p className="font-semibold text-foreground">
                          {attempt.totalQuestions}
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Trophy className="w-4 h-4" />
                          Status
                        </div>
                        <p className={`font-semibold ${
                          percentage >= 50 ? 'text-success' : 'text-destructive'
                        }`}>
                          {percentage >= 50 ? 'Passed' : 'Failed'}
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          Violations
                        </div>
                        <p className={`font-semibold ${
                          attempt.violations.length > 0 ? 'text-warning' : 'text-success'
                        }`}>
                          {attempt.violations.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentResults;
