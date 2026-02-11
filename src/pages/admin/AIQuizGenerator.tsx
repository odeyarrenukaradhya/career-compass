import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AIQuizReview } from '@/components/admin/AIQuizReview';

const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'IBM', 'Cognizant', 'Accenture',
  'HCL', 'Tech Mahindra', 'Capgemini', 'Deloitte', 'Amazon', 'Google',
  'Microsoft', 'Zoho', 'Mindtree', 'L&T Infotech',
];

const TOPICS = [
  { id: 'quantitative', label: 'Quantitative Aptitude' },
  { id: 'verbal', label: 'Verbal Ability' },
  { id: 'logical', label: 'Logical Reasoning' },
  { id: 'soft-skills', label: 'Soft Skills' },
];

const QUESTION_COUNTS = [15, 30, 60];
const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

export interface GeneratedQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  explanation: string;
}

const AIQuizGenerator = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [difficulty, setDifficulty] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[] | null>(null);

  const toggleTopic = (topicLabel: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicLabel)
        ? prev.filter(t => t !== topicLabel)
        : [...prev, topicLabel]
    );
  };

  const handleGenerate = async () => {
    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }
    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          company: selectedCompany,
          topics: selectedTopics,
          questionCount,
          difficulty,
        },
      });

      if (error) throw error;
      if (!data?.questions) throw new Error('No questions received');

      setGeneratedQuestions(data.questions);
      toast.success(`${data.questions.length} questions generated successfully!`);
    } catch (err: any) {
      console.error('Generation error:', err);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedQuestions) {
    return (
      <AIQuizReview
        questions={generatedQuestions}
        company={selectedCompany}
        topics={selectedTopics}
        difficulty={difficulty}
        onBack={() => setGeneratedQuestions(null)}
        onQuestionsUpdate={setGeneratedQuestions}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/quizzes')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Quiz Generator</h1>
            <p className="text-muted-foreground mt-1">
              Generate placement-pattern questions with AI
            </p>
          </div>
        </div>

        {/* Company Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Company Category</CardTitle>
            <CardDescription>Select the company whose exam pattern to follow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COMPANIES.map(company => (
                <button
                  key={company}
                  onClick={() => setSelectedCompany(company)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    selectedCompany === company
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {company}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Topics */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Quiz Topics</CardTitle>
            <CardDescription>Select one or more topics (multi-select)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.label)}
                  className={`p-4 rounded-xl text-sm font-medium transition-all border text-center ${
                    selectedTopics.includes(topic.label)
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
            {selectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {selectedTopics.map(t => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Count */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Number of Questions</CardTitle>
            <CardDescription>Choose how many questions to generate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {QUESTION_COUNTS.map(count => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`flex-1 p-4 rounded-xl text-center font-bold text-lg transition-all border ${
                    questionCount === count
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Level */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Difficulty Level</CardTitle>
            <CardDescription>Set the complexity of questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {DIFFICULTY_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 p-4 rounded-xl text-center font-medium transition-all border ${
                    difficulty === level
                      ? level === 'Easy' ? 'bg-green-600 text-white border-green-600 shadow-md'
                        : level === 'Medium' ? 'bg-yellow-500 text-white border-yellow-500 shadow-md'
                        : 'bg-red-600 text-white border-red-600 shadow-md'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary & Generate */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2 mb-4 text-sm">
              {selectedCompany && <Badge>{selectedCompany}</Badge>}
              {selectedTopics.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
              <Badge variant="secondary">{questionCount} questions</Badge>
              <Badge variant="secondary">{difficulty}</Badge>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedCompany || selectedTopics.length === 0}
              className="w-full h-14 text-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating {questionCount} Questions...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIQuizGenerator;
