import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createQuiz, generateQuizCode, Question } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PlusCircle,
  Trash2,
  Save,
  ArrowLeft,
  GripVertical,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('15');
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([
    {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...questions];
    if (field === 'text') {
      updated[index].text = value as string;
    } else if (field === 'correctAnswer') {
      updated[index].correctAnswer = value as number;
    }
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please enter a quiz description');
      return;
    }

    const validQuestions = questions.filter(
      q => q.text.trim() && q.options.every(o => o.trim())
    );

    if (validQuestions.length === 0) {
      toast.error('Please add at least one complete question');
      return;
    }

    const quiz = createQuiz({
      code: generateQuizCode(),
      title: title.trim(),
      description: description.trim(),
      duration: parseInt(duration),
      questions: validQuestions.map((q, i) => ({
        ...q,
        id: `q${i + 1}`,
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/quizzes')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Create Quiz</h1>
            <p className="text-muted-foreground mt-1">
              Design a new assessment for students
            </p>
          </div>
        </div>

        {/* Quiz Details */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>Basic information about the quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Technical Aptitude Test"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what this quiz covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="180"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="max-w-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Questions</h2>
            <Button variant="outline" onClick={addQuestion}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <Card key={qIndex} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                  </div>
                  {questions.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter your question..."
                    value={question.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Options (select the correct answer)</Label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          question.correctAnswer === oIndex
                            ? 'bg-success text-success-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {question.correctAnswer === oIndex ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          String.fromCharCode(65 + oIndex)
                        )}
                      </button>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Click the letter circle to mark the correct answer
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-4">
          <Button variant="outline" onClick={() => navigate('/admin/quizzes')} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateQuiz;
