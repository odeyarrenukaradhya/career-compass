import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllQuizzes, getAttemptsByQuiz, deleteQuiz } from '@/lib/data';
import { Link } from 'react-router-dom';
import { 
  FileQuestion, 
  PlusCircle,
  Sparkles,
  Clock,
  Users,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState(getAllQuizzes());

  const handleDelete = (quizId: string) => {
    deleteQuiz(quizId);
    setQuizzes(getAllQuizzes());
  };

  const activeQuizzes = quizzes.filter(q => q.isActive);
  const archivedQuizzes = quizzes.filter(q => !q.isActive);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">All Quizzes</h1>
            <p className="text-muted-foreground mt-1">
              Manage your assessments and view attempt statistics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/quizzes/ai-generate">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/quizzes/create">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Manually
              </Link>
            </Button>
          </div>
        </div>

        {/* Active Quizzes */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Active Quizzes</h2>
          {activeQuizzes.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="pt-12 pb-12 text-center">
                <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Quizzes Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first quiz to get started
                </p>
                <Button asChild>
                  <Link to="/admin/quizzes/create">Create Quiz</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeQuizzes.map((quiz) => {
                const attempts = getAttemptsByQuiz(quiz.id);
                const avgScore = attempts.length > 0
                  ? Math.round(attempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0) / attempts.length)
                  : 0;
                
                return (
                  <Card key={quiz.id} className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileQuestion className="w-5 h-5 text-primary" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(quiz.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-lg mt-3">{quiz.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {quiz.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div className="p-2 rounded bg-muted">
                          <p className="text-lg font-bold text-foreground">{quiz.questions.length}</p>
                          <p className="text-xs text-muted-foreground">Questions</p>
                        </div>
                        <div className="p-2 rounded bg-muted">
                          <p className="text-lg font-bold text-foreground">{attempts.length}</p>
                          <p className="text-xs text-muted-foreground">Attempts</p>
                        </div>
                        <div className="p-2 rounded bg-muted">
                          <p className="text-lg font-bold text-foreground">{avgScore}%</p>
                          <p className="text-xs text-muted-foreground">Avg Score</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                          {quiz.code}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {quiz.duration} mins
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Archived Quizzes */}
        {archivedQuizzes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Archived Quizzes</h2>
            <div className="space-y-2">
              {archivedQuizzes.map((quiz) => (
                <div 
                  key={quiz.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <FileQuestion className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{quiz.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Archived</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminQuizzes;
