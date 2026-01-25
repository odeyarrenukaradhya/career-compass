import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { getQuizByCode, createAttempt, hasAttempted, Quiz } from '@/lib/data';
import { startMonitoring, stopMonitoring, recordAnswer } from '@/lib/monitoring';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  FileQuestion
} from 'lucide-react';

type QuizState = 'loading' | 'not-found' | 'already-attempted' | 'instructions' | 'active' | 'submitted';

const QuizAttempt = () => {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!quizCode) {
      setQuizState('not-found');
      return;
    }

    const foundQuiz = getQuizByCode(quizCode);
    
    if (!foundQuiz) {
      setQuizState('not-found');
      return;
    }

    if (hasAttempted(foundQuiz.id, user?.id || '')) {
      setQuizState('already-attempted');
      return;
    }

    setQuiz(foundQuiz);
    setTimeLeft(foundQuiz.duration * 60);
    setQuizState('instructions');
  }, [quizCode, user?.id]);

  // Timer
  useEffect(() => {
    if (quizState !== 'active' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, timeLeft]);

  const handleStartQuiz = () => {
    startMonitoring();
    setQuizState('active');
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    recordAnswer();
  };

  const handleSubmit = useCallback(() => {
    if (!quiz || !user) return;

    const violations = stopMonitoring();
    
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    // Save attempt
    createAttempt({
      quizId: quiz.id,
      studentId: user.id,
      studentName: user.name,
      answers,
      score: correctAnswers,
      totalQuestions: quiz.questions.length,
      startedAt: new Date(Date.now() - (quiz.duration * 60 - timeLeft) * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      violations,
    });

    setScore(correctAnswers);
    setQuizState('submitted');
  }, [quiz, user, answers, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading
  if (quizState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not found
  if (quizState === 'not-found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8">
            <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Quiz Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The quiz code "{quizCode}" doesn't exist or is no longer available.
            </p>
            <Button onClick={() => navigate('/student/quizzes')}>
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already attempted
  if (quizState === 'already-attempted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Already Completed</h2>
            <p className="text-muted-foreground mb-6">
              You have already attempted this quiz. Check your results in the dashboard.
            </p>
            <Button onClick={() => navigate('/student/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Instructions
  if (quizState === 'instructions' && quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            <CardDescription className="mt-2">{quiz.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted">
                <FileQuestion className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{quiz.questions.length}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{quiz.duration}</p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Important Instructions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Do not switch tabs or windows during the quiz</li>
                    <li>• Right-click and copy/paste are disabled</li>
                    <li>• Your activity will be monitored for integrity</li>
                    <li>• Quiz auto-submits when time expires</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/student/quizzes')} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleStartQuiz} className="flex-1">
                Start Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active quiz
  if (quizState === 'active' && quiz) {
    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    const isLastQuestion = currentQuestion === quiz.questions.length - 1;
    const canSubmit = Object.keys(answers).length === quiz.questions.length;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-foreground">{quiz.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft < 60 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
          </div>
        </div>

        {/* Question */}
        <div className="pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-3xl">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl">{question.text}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(question.id, index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        answers[question.id] === index
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-card hover:border-primary/50 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          answers[question.id] === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-1">
                {quiz.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                      i === currentQuestion
                        ? 'bg-primary text-primary-foreground'
                        : answers[quiz.questions[i].id] !== undefined
                        ? 'bg-success/20 text-success'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {isLastQuestion ? (
                <Button onClick={handleSubmit} disabled={!canSubmit}>
                  Submit Quiz
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Submitted
  if (quizState === 'submitted' && quiz) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const isPassing = percentage >= 50;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              isPassing ? 'bg-success/10' : 'bg-warning/10'
            }`}>
              {isPassing ? (
                <CheckCircle2 className="w-10 h-10 text-success" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-warning" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isPassing ? 'Great Job!' : 'Quiz Completed'}
            </h2>
            
            <p className="text-muted-foreground mb-6">
              You scored {score} out of {quiz.questions.length} questions
            </p>

            <div className="p-6 rounded-xl bg-muted mb-6">
              <p className={`text-4xl font-bold ${
                isPassing ? 'text-success' : 'text-warning'
              }`}>
                {percentage}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Your Score</p>
            </div>

            <Button onClick={() => navigate('/student/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default QuizAttempt;
