import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SUGGESTED_DOMAINS = [
  'Software Engineering', 'Data Science', 'Product Management',
  'DevOps', 'UI/UX Design', 'Cybersecurity', 'Cloud Computing',
  'Machine Learning', 'Frontend Development', 'Backend Development',
];

interface DomainSelectionProps {
  onStart: (domain: string) => void;
}

export const DomainSelection = ({ onStart }: DomainSelectionProps) => {
  const [domain, setDomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  const selectedDomain = customDomain || domain;

  const handleStart = () => {
    if (!selectedDomain.trim()) {
      toast({ title: 'Please select or enter a domain', variant: 'destructive' });
      return;
    }
    onStart(selectedDomain);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Choose Your Interview Domain
        </CardTitle>
        <CardDescription>
          Select a domain or type your own. The AI will speak questions aloud and listen to your answers.
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

        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <p className="text-sm font-medium text-foreground">🎤 Voice Interview</p>
          <p className="text-xs text-muted-foreground">
            The AI will speak each question aloud. Click the microphone to answer with your voice.
            Your speech will be converted to text and evaluated. Make sure your microphone is enabled.
          </p>
        </div>

        <Button className="w-full" size="lg" onClick={handleStart} disabled={!selectedDomain.trim()}>
          Start Voice Interview <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
