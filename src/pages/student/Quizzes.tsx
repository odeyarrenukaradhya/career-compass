import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getQuizzes, getAttemptsByStudent, hasAttempted } from '@/lib/data';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileQuestion, 
  Clock, 
  Search,
  CheckCircle2,
  ArrowRight,
  BookOpen
} from 'lucide-react';

const StudentQuizzes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [quizCode, setQuizCode] = useState('');
  
  const quizzes = getQuizzes();
  const myAttempts = getAttemptsByStudent(user?.id || '');

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinByCode = () => {
    if (quizCode.trim()) {
      navigate(`/student/quiz/${quizCode.trim().toUpperCase()}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            Browse available assessments or enter a quiz code
          </p>
        </div>

        {/* Join by Code */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Join Quiz by Code</CardTitle>
            <CardDescription>Have a quiz code? Enter it below to start</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter quiz code (e.g., TECH101)"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                className="max-w-xs uppercase"
              />
              <Button onClick={handleJoinByCode} disabled={!quizCode.trim()}>
                Join Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quiz Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => {
            const attempted = hasAttempted(quiz.id, user?.id || '');
            const attempt = myAttempts.find(a => a.quizId === quiz.id);
            
            return (
              <Card 
                key={quiz.id} 
                className={`bg-card border-border hover:shadow-lg transition-shadow ${
                  attempted ? 'opacity-75' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    {attempted && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-4">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="w-4 h-4" />
                      {quiz.questions.length} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.duration} mins
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {quiz.code}
                    </span>
                    {attempted ? (
                      <div className="text-sm font-medium text-success">
                        Score: {attempt?.score}/{attempt?.totalQuestions}
                      </div>
                    ) : (
                      <Button size="sm" asChild>
                        <Link to={`/student/quiz/${quiz.code}`}>
                          Start Quiz
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No quizzes found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizzes;
