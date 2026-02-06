import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Mic, Send, ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  Brain, Target, MessageSquare, Star, Award, RotateCcw
} from 'lucide-react';

type Phase = 'domain-select' | 'interviewing' | 'reviewing' | 'results';

interface Question {
  id: number;
  question: string;
  category: string;
}

interface QAEntry {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  improvement: string;
}

interface FinalReview {
  overallScore: number;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: string;
  actionPlan: string[];
  readinessLevel: string;
}

const SUGGESTED_DOMAINS = [
  'Software Engineering', 'Data Science', 'Product Management',
  'DevOps', 'UI/UX Design', 'Cybersecurity', 'Cloud Computing',
  'Machine Learning', 'Frontend Development', 'Backend Development',
];

const MockInterview = () => {
  const [phase, setPhase] = useState<Phase>('domain-select');
  const [domain, setDomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [qaEntries, setQaEntries] = useState<QAEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [finalReview, setFinalReview] = useState<FinalReview | null>(null);

  const selectedDomain = customDomain || domain;

  const callAI = async (body: any) => {
    const { data, error } = await supabase.functions.invoke('mock-interview', { body });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data.result;
  };

  const startInterview = async () => {
    if (!selectedDomain.trim()) {
      toast({ title: 'Please select or enter a domain', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const result = await callAI({ action: 'generate_questions', domain: selectedDomain });
      if (Array.isArray(result) && result.length > 0) {
        setQuestions(result);
        setPhase('interviewing');
        setCurrentQ(0);
        setQaEntries([]);
      } else {
        throw new Error('Invalid questions format');
      }
    } catch (e: any) {
      toast({ title: 'Failed to generate questions', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast({ title: 'Please type your answer', variant: 'destructive' });
      return;
    }
    setEvaluating(true);
    try {
      const evaluation = await callAI({
        action: 'evaluate_answer',
        conversation: {
          questionIndex: currentQ,
          question: questions[currentQ].question,
          answer: answer.trim(),
        },
      });

      const entry: QAEntry = {
        question: questions[currentQ].question,
        answer: answer.trim(),
        score: evaluation.overallScore || 5,
        feedback: evaluation.feedback || '',
        improvement: evaluation.improvement || '',
      };

      const newEntries = [...qaEntries, entry];
      setQaEntries(newEntries);
      setAnswer('');

      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        // All questions answered, get final review
        setPhase('reviewing');
        await getFinalReview(newEntries);
      }
    } catch (e: any) {
      toast({ title: 'Evaluation failed', description: e.message, variant: 'destructive' });
    } finally {
      setEvaluating(false);
    }
  };

  const getFinalReview = async (entries: QAEntry[]) => {
    setLoading(true);
    try {
      const review = await callAI({
        action: 'final_review',
        conversation: {
          domain: selectedDomain,
          questionsAndAnswers: entries,
        },
      });
      setFinalReview(review);
      setPhase('results');
    } catch (e: any) {
      toast({ title: 'Review failed', description: e.message, variant: 'destructive' });
      setPhase('results');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setPhase('domain-select');
    setDomain('');
    setCustomDomain('');
    setQuestions([]);
    setCurrentQ(0);
    setAnswer('');
    setQaEntries([]);
    setFinalReview(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              AI Mock Interview
            </h1>
            <p className="text-muted-foreground mt-1">
              Practice with an AI interviewer and get instant feedback
            </p>
          </div>
          {phase !== 'domain-select' && (
            <Button variant="outline" onClick={restart}>
              <RotateCcw className="w-4 h-4 mr-2" /> Start Over
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        {phase === 'interviewing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span>{Math.round(((currentQ) / questions.length) * 100)}% complete</span>
            </div>
            <Progress value={(currentQ / questions.length) * 100} />
          </div>
        )}

        {/* Phase: Domain Selection */}
        {phase === 'domain-select' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Choose Your Interview Domain
              </CardTitle>
              <CardDescription>
                Select a domain or type your own to begin the mock interview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_DOMAINS.map((d) => (
                  <Badge
                    key={d}
                    variant={domain === d && !customDomain ? 'default' : 'outline'}
                    className="cursor-pointer text-sm py-1.5 px-3 transition-colors hover:bg-primary hover:text-primary-foreground"
                    onClick={() => { setDomain(d); setCustomDomain(''); }}
                  >
                    {d}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or enter custom</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Input
                placeholder="e.g. Blockchain Development, Digital Marketing..."
                value={customDomain}
                onChange={(e) => { setCustomDomain(e.target.value); setDomain(''); }}
              />

              <Button
                className="w-full"
                size="lg"
                onClick={startInterview}
                disabled={!selectedDomain.trim() || loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing Interview...</>
                ) : (
                  <>Start Interview <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Phase: Interviewing */}
        {phase === 'interviewing' && questions.length > 0 && (
          <div className="space-y-4">
            {/* Current question */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{questions[currentQ].category}</Badge>
                  <span className="text-sm text-muted-foreground">Q{currentQ + 1}</span>
                </div>
                <CardTitle className="text-lg mt-2">
                  {questions[currentQ].question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your answer here... Be detailed and professional."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  className="resize-none"
                  disabled={evaluating}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Tip: Answer as if in a real interview. Be clear, structured, and confident.
                  </p>
                  <Button onClick={submitAnswer} disabled={evaluating || !answer.trim()}>
                    {evaluating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</>
                    ) : currentQ < questions.length - 1 ? (
                      <>Submit & Next <ArrowRight className="w-4 h-4 ml-2" /></>
                    ) : (
                      <>Submit & Finish <CheckCircle2 className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Previous answers feedback */}
            {qaEntries.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Previous Answers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {qaEntries.map((qa, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-foreground">Q{i + 1}: {qa.question}</p>
                        <Badge variant={qa.score >= 7 ? 'default' : qa.score >= 5 ? 'secondary' : 'destructive'}>
                          {qa.score}/10
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{qa.feedback}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Phase: Reviewing */}
        {phase === 'reviewing' && (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">Analyzing Your Interview...</h3>
              <p className="text-muted-foreground">
                Our AI is reviewing your answers, communication style, and overall performance.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Phase: Results */}
        {phase === 'results' && finalReview && (
          <div className="space-y-6">
            {/* Score card */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Award className="w-16 h-16 mx-auto text-primary" />
                  <div>
                    <p className={`text-6xl font-bold ${getScoreColor(finalReview.overallScore)}`}>
                      {finalReview.overallScore}
                    </p>
                    <p className="text-muted-foreground mt-1">out of 100</p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Badge variant="outline" className="text-lg px-4 py-1">
                      Grade: {finalReview.grade}
                    </Badge>
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      {finalReview.readinessLevel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-success">
                    <Star className="w-5 h-5" /> Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {finalReview.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-warning">
                    <Target className="w-5 h-5" /> Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {finalReview.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <ArrowRight className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Feedback */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> Detailed Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                  {finalReview.detailedFeedback}
                </p>
              </CardContent>
            </Card>

            {/* Action Plan */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" /> Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {finalReview.actionPlan.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      {a}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Question-by-question breakdown */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Question Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {qaEntries.map((qa, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm text-foreground">Q{i + 1}: {qa.question}</p>
                      <Badge variant={qa.score >= 7 ? 'default' : qa.score >= 5 ? 'secondary' : 'destructive'}>
                        {qa.score}/10
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground"><strong>Your answer:</strong> {qa.answer}</p>
                    <p className="text-xs text-foreground">{qa.feedback}</p>
                    <p className="text-xs text-primary">💡 {qa.improvement}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={restart}>
              <RotateCcw className="w-4 h-4 mr-2" /> Try Another Interview
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MockInterview;
