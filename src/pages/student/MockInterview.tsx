import { useState, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DomainSelection } from '@/components/mock-interview/DomainSelection';
import { VoiceInterview } from '@/components/mock-interview/VoiceInterview';
import { InterviewResults } from '@/components/mock-interview/InterviewResults';
import { Brain, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type Phase = 'domain-select' | 'preparing' | 'interviewing' | 'reviewing' | 'results';

export interface Question {
  id: number;
  question: string;
  category: string;
}

export interface QAEntry {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  improvement: string;
}

export interface FinalReview {
  overallScore: number;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: string;
  actionPlan: string[];
  readinessLevel: string;
}

const MockInterview = () => {
  const [phase, setPhase] = useState<Phase>('domain-select');
  const [domain, setDomain] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qaEntries, setQaEntries] = useState<QAEntry[]>([]);
  const [finalReview, setFinalReview] = useState<FinalReview | null>(null);

  const callAI = async (body: any) => {
    const { data, error } = await supabase.functions.invoke('mock-interview', { body });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data.result;
  };

  const startInterview = async (selectedDomain: string) => {
    setDomain(selectedDomain);
    setPhase('preparing');
    try {
      const result = await callAI({
        action: 'generate_questions',
        domain: selectedDomain,
        conversation: { questionCount: 12 },
      });
      if (Array.isArray(result) && result.length > 0) {
        setQuestions(result);
        setQaEntries([]);
        setPhase('interviewing');
      } else {
        throw new Error('Invalid questions format');
      }
    } catch (e: any) {
      toast({ title: 'Failed to generate questions', description: e.message, variant: 'destructive' });
      setPhase('domain-select');
    }
  };

  const handleInterviewComplete = async (entries: QAEntry[]) => {
    setQaEntries(entries);
    setPhase('reviewing');
    try {
      const review = await callAI({
        action: 'final_review',
        conversation: { domain, questionsAndAnswers: entries },
      });
      setFinalReview(review);
      setPhase('results');
    } catch (e: any) {
      toast({ title: 'Review failed', description: e.message, variant: 'destructive' });
      setPhase('results');
    }
  };

  const restart = () => {
    setPhase('domain-select');
    setDomain('');
    setQuestions([]);
    setQaEntries([]);
    setFinalReview(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              AI Voice Interview
            </h1>
            <p className="text-muted-foreground mt-1">
              Practice with an AI interviewer that speaks and listens
            </p>
          </div>
          {phase !== 'domain-select' && phase !== 'preparing' && (
            <Button variant="outline" onClick={restart}>
              <RotateCcw className="w-4 h-4 mr-2" /> Start Over
            </Button>
          )}
        </div>

        {phase === 'domain-select' && (
          <DomainSelection onStart={startInterview} />
        )}

        {phase === 'preparing' && (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">Preparing Your Interview...</h3>
              <p className="text-muted-foreground">Generating 10-15 professional questions for {domain}</p>
            </CardContent>
          </Card>
        )}

        {phase === 'interviewing' && questions.length > 0 && (
          <VoiceInterview
            questions={questions}
            domain={domain}
            onComplete={handleInterviewComplete}
            callAI={callAI}
          />
        )}

        {phase === 'reviewing' && (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">Analyzing Your Interview...</h3>
              <p className="text-muted-foreground">
                Reviewing your answers, communication style, and overall performance.
              </p>
            </CardContent>
          </Card>
        )}

        {phase === 'results' && (
          <InterviewResults
            finalReview={finalReview}
            qaEntries={qaEntries}
            onRestart={restart}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MockInterview;
