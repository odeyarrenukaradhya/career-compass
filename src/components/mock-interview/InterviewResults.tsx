import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award, Star, Target, MessageSquare, CheckCircle2,
  ArrowRight, RotateCcw
} from 'lucide-react';
import type { QAEntry, FinalReview } from '@/pages/student/MockInterview';

interface InterviewResultsProps {
  finalReview: FinalReview | null;
  qaEntries: QAEntry[];
  onRestart: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-destructive';
};

export const InterviewResults = ({ finalReview, qaEntries, onRestart }: InterviewResultsProps) => {
  if (!finalReview) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-16 text-center space-y-4">
          <p className="text-muted-foreground">Review could not be generated.</p>
          <Button onClick={onRestart}><RotateCcw className="w-4 h-4 mr-2" /> Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
              <Badge variant="outline" className="text-lg px-4 py-1">Grade: {finalReview.grade}</Badge>
              <Badge variant="secondary" className="text-lg px-4 py-1">{finalReview.readinessLevel}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-green-500">
              <Star className="w-5 h-5" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {finalReview.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-yellow-500">
              <Target className="w-5 h-5" /> Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {finalReview.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <ArrowRight className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />{w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Detailed Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{finalReview.detailedFeedback}</p>
        </CardContent>
      </Card>

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
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

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

      <Button className="w-full" size="lg" onClick={onRestart}>
        <RotateCcw className="w-4 h-4 mr-2" /> Try Another Interview
      </Button>
    </div>
  );
};
