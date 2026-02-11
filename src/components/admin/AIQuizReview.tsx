import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Save, CheckCircle2, Trash2, Edit3, Eye, 
  ChevronDown, ChevronUp 
} from 'lucide-react';
import { toast } from 'sonner';
import { createQuiz, generateQuizCode } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import type { GeneratedQuestion } from '@/pages/admin/AIQuizGenerator';

interface AIQuizReviewProps {
  questions: GeneratedQuestion[];
  company: string;
  topics: string[];
  difficulty: string;
  onBack: () => void;
  onQuestionsUpdate: (questions: GeneratedQuestion[]) => void;
}

export const AIQuizReview = ({
  questions,
  company,
  topics,
  difficulty,
  onBack,
  onQuestionsUpdate,
}: AIQuizReviewProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState(`${company} - ${topics.join(', ')} (${difficulty})`);
  const [description, setDescription] = useState(
    `AI-generated ${difficulty.toLowerCase()} level placement test based on ${company} pattern covering ${topics.join(', ')}.`
  );
  const [duration, setDuration] = useState(String(Math.ceil(questions.length * 1.5)));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const updateQuestion = (index: number, field: keyof GeneratedQuestion, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    onQuestionsUpdate(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    onQuestionsUpdate(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error('Must have at least one question');
      return;
    }
    const updated = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, id: `q${i + 1}` }));
    onQuestionsUpdate(updated);
    setEditingIndex(null);
    toast.success('Question removed');
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    const quiz = createQuiz({
      code: generateQuizCode(),
      title: title.trim(),
      description: description.trim(),
      duration: parseInt(duration),
      questions: questions.map((q, i) => ({
        id: `q${i + 1}`,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
      createdBy: user?.id || '',
      isActive: true,
    });

    toast.success(`Quiz created with code: ${quiz.code}`);
    navigate('/admin/quizzes');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Review & Edit Questions</h1>
            <p className="text-muted-foreground mt-1">
              Review AI-generated questions, edit if needed, then save
            </p>
          </div>
        </div>

        {/* Quiz Details */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge>{company}</Badge>
              {topics.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
              <Badge variant="secondary">{difficulty}</Badge>
              <Badge variant="secondary">{questions.length} questions</Badge>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dur">Duration (minutes)</Label>
              <Input id="dur" type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} className="max-w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Questions ({questions.length})
            </h2>
          </div>

          {questions.map((question, qIndex) => {
            const isEditing = editingIndex === qIndex;
            const isExpanded = expandedIndex === qIndex;

            return (
              <Card key={qIndex} className="bg-card border-border">
                <CardContent className="pt-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Q{qIndex + 1}
                      </span>
                      <Badge variant="outline" className="text-xs">{question.topic}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => setEditingIndex(isEditing ? null : qIndex)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => setExpandedIndex(isExpanded ? null : qIndex)}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Question Text */}
                  {isEditing ? (
                    <Textarea
                      value={question.text}
                      onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                      rows={2}
                      className="mb-3"
                    />
                  ) : (
                    <p className="text-sm text-foreground mb-3">{question.text}</p>
                  )}

                  {/* Options - always visible in compact form, expanded shows edit */}
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => isEditing ? updateQuestion(qIndex, 'correctAnswer', oIndex) : undefined}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                            question.correctAnswer === oIndex
                              ? 'bg-green-600 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {question.correctAnswer === oIndex ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            String.fromCharCode(65 + oIndex)
                          )}
                        </button>
                        {isEditing ? (
                          <Input
                            value={option}
                            onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 h-8 text-sm"
                          />
                        ) : (
                          <span className={`text-sm ${question.correctAnswer === oIndex ? 'font-medium text-green-600' : 'text-muted-foreground'}`}>
                            {option}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation (expanded) */}
                  {(isExpanded || isEditing) && question.explanation && (
                    <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
                      <strong>Explanation:</strong>{' '}
                      {isEditing ? (
                        <Input
                          value={question.explanation}
                          onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)}
                          className="mt-1 h-7 text-xs"
                        />
                      ) : (
                        question.explanation
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            ← Back to Generator
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Quiz ({questions.length} questions)
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};
