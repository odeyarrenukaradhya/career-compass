import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { useSpeechSynthesis, useSpeechRecognition } from '@/hooks/useSpeech';
import {
  Mic, MicOff, Volume2, ArrowRight, CheckCircle2, Loader2, SkipForward
} from 'lucide-react';
import type { Question, QAEntry } from '@/pages/student/MockInterview';

interface VoiceInterviewProps {
  questions: Question[];
  domain: string;
  onComplete: (entries: QAEntry[]) => void;
  callAI: (body: any) => Promise<any>;
}

type InterviewState = 'speaking-question' | 'listening' | 'evaluating' | 'showing-feedback';

export const VoiceInterview = ({ questions, domain, onComplete, callAI }: VoiceInterviewProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [state, setState] = useState<InterviewState>('speaking-question');
  const [qaEntries, setQaEntries] = useState<QAEntry[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<QAEntry | null>(null);
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const { startListening, stopListening, isListening, transcript, interimTranscript, setTranscript } = useSpeechRecognition();
  const listenPromiseRef = useRef<Promise<string> | null>(null);

  // Speak the current question when it changes
  useEffect(() => {
    if (state === 'speaking-question') {
      const q = questions[currentQ];
      const intro = currentQ === 0
        ? `Welcome to your ${domain} interview. Let's begin. Question ${currentQ + 1}. ${q.question}`
        : `Question ${currentQ + 1}. ${q.question}`;

      speak(intro).then(() => {
        setState('listening');
        setTranscript('');
        listenPromiseRef.current = startListening();
      }).catch(() => {
        // If speech fails, still allow answering
        setState('listening');
        setTranscript('');
        listenPromiseRef.current = startListening();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, state === 'speaking-question']);

  const handleStopAndSubmit = useCallback(async () => {
    stopListening();
    setState('evaluating');

    // Wait a moment for final transcript
    await new Promise((r) => setTimeout(r, 500));

    const finalAnswer = transcript.trim();
    if (!finalAnswer) {
      toast({ title: 'No answer detected', description: 'Please try again.', variant: 'destructive' });
      setState('listening');
      setTranscript('');
      listenPromiseRef.current = startListening();
      return;
    }

    try {
      const evaluation = await callAI({
        action: 'evaluate_answer',
        conversation: {
          questionIndex: currentQ,
          question: questions[currentQ].question,
          answer: finalAnswer,
        },
      });

      const entry: QAEntry = {
        question: questions[currentQ].question,
        answer: finalAnswer,
        score: evaluation.overallScore || 5,
        feedback: evaluation.feedback || '',
        improvement: evaluation.improvement || '',
      };

      setCurrentFeedback(entry);
      setState('showing-feedback');

      // Speak brief feedback
      speak(`Score: ${entry.score} out of 10. ${entry.feedback}`);
    } catch (e: any) {
      toast({ title: 'Evaluation failed', description: e.message, variant: 'destructive' });
      setState('listening');
      setTranscript('');
      listenPromiseRef.current = startListening();
    }
  }, [stopListening, transcript, callAI, currentQ, questions, speak, startListening, setTranscript]);

  const handleNext = useCallback(() => {
    stopSpeaking();
    if (currentFeedback) {
      const newEntries = [...qaEntries, currentFeedback];
      setQaEntries(newEntries);
      setCurrentFeedback(null);

      if (currentQ < questions.length - 1) {
        setCurrentQ((prev) => prev + 1);
        setState('speaking-question');
      } else {
        onComplete(newEntries);
      }
    }
  }, [currentFeedback, qaEntries, currentQ, questions.length, onComplete, stopSpeaking]);

  const handleSkip = useCallback(() => {
    stopListening();
    stopSpeaking();
    const entry: QAEntry = {
      question: questions[currentQ].question,
      answer: '(Skipped)',
      score: 0,
      feedback: 'Question was skipped.',
      improvement: 'Try to answer all questions for a complete evaluation.',
    };
    const newEntries = [...qaEntries, entry];
    setQaEntries(newEntries);

    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setState('speaking-question');
    } else {
      onComplete(newEntries);
    }
  }, [stopListening, stopSpeaking, questions, currentQ, qaEntries, onComplete]);

  const progress = ((currentQ) / questions.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Main interview card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{questions[currentQ].category}</Badge>
            <span className="text-sm text-muted-foreground">Q{currentQ + 1}</span>
          </div>
          <CardTitle className="text-lg mt-2">{questions[currentQ].question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice status indicator */}
          <div className="flex flex-col items-center space-y-4">
            {state === 'speaking-question' && (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Volume2 className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">AI is asking the question...</p>
              </div>
            )}

            {state === 'listening' && (
              <div className="flex flex-col items-center space-y-3 w-full">
                <button
                  onClick={handleStopAndSubmit}
                  className="w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                >
                  <Mic className="w-12 h-12 text-destructive animate-pulse" />
                </button>
                <p className="text-sm font-medium text-foreground">
                  {isListening ? '🔴 Listening... Click mic to finish' : 'Starting microphone...'}
                </p>

                {/* Live transcript */}
                <div className="w-full min-h-[80px] p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Your answer (live):</p>
                  <p className="text-sm text-foreground">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-muted-foreground italic"> {interimTranscript}</span>
                    )}
                    {!transcript && !interimTranscript && (
                      <span className="text-muted-foreground">Start speaking...</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {state === 'evaluating' && (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Evaluating your answer...</p>
              </div>
            )}

            {state === 'showing-feedback' && currentFeedback && (
              <div className="w-full space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-foreground">Your Answer:</p>
                    <Badge variant={currentFeedback.score >= 7 ? 'default' : currentFeedback.score >= 5 ? 'secondary' : 'destructive'}>
                      {currentFeedback.score}/10
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentFeedback.answer}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                  <p className="text-sm font-medium text-foreground">Feedback:</p>
                  <p className="text-sm text-muted-foreground">{currentFeedback.feedback}</p>
                  <p className="text-sm text-primary mt-2">💡 {currentFeedback.improvement}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            {state === 'listening' && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                <SkipForward className="w-4 h-4 mr-1" /> Skip
              </Button>
            )}
            {state === 'showing-feedback' && (
              <>
                <div />
                <Button onClick={handleNext}>
                  {currentQ < questions.length - 1 ? (
                    <>Next Question <ArrowRight className="w-4 h-4 ml-2" /></>
                  ) : (
                    <>Finish Interview <CheckCircle2 className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Previous answers */}
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
  );
};
