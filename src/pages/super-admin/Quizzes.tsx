import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllQuizzes, getAttemptsByQuiz } from '@/lib/data';
import { 
  FileQuestion, 
  Clock,
  Users,
  CheckCircle2
} from 'lucide-react';

const SuperAdminQuizzes = () => {
  const quizzes = getAllQuizzes();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">All Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            Read-only view of all platform quizzes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => {
            const attempts = getAttemptsByQuiz(quiz.id);
            
            return (
              <Card key={quiz.id} className={`bg-card border-border ${!quiz.isActive && 'opacity-60'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileQuestion className="w-5 h-5 text-primary" />
                    </div>
                    {quiz.isActive ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                        Archived
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {attempts.length} attempts
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.duration} mins
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminQuizzes;
