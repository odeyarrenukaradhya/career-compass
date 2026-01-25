import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableRoles, generateCareerRoadmap, CareerRoadmap } from '@/lib/careerAI';
import { 
  Map, 
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const StudentCareer = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [duration, setDuration] = useState('12');
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedRole) return;
    
    setIsGenerating(true);
    try {
      const result = await generateCareerRoadmap(selectedRole, parseInt(duration));
      setRoadmap(result);
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
    }
    setIsGenerating(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Career Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Get a personalized roadmap to achieve your career goals
          </p>
        </div>

        {/* Phase 2 Notice */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">AI-Powered Career Guidance</h4>
                <p className="text-sm text-muted-foreground">
                  This feature uses AI to generate personalized career roadmaps. Currently showing demo data.
                  Full AI integration coming in Phase 2.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Select Your Goal
            </CardTitle>
            <CardDescription>Choose a career path and timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Desired Role
                </label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Timeline (Weeks)
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 weeks</SelectItem>
                    <SelectItem value="8">8 weeks</SelectItem>
                    <SelectItem value="12">12 weeks</SelectItem>
                    <SelectItem value="24">24 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleGenerate} 
                  disabled={!selectedRole || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Roadmap
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Roles Grid */}
        {!roadmap && (
          <div className="grid md:grid-cols-2 gap-4">
            {availableRoles.map(role => (
              <Card 
                key={role.id} 
                className={`bg-card border-border cursor-pointer transition-all hover:shadow-lg ${
                  selectedRole === role.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {role.category}
                    </span>
                    <span className="text-sm font-medium text-success">{role.averageSalary}</span>
                  </div>
                  <CardTitle className="mt-2">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {role.requiredSkills.map(skill => (
                      <span 
                        key={skill}
                        className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Generated Roadmap */}
        {roadmap && (
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Your {roadmap.role} Roadmap
                  </CardTitle>
                  <CardDescription>
                    {roadmap.duration} week journey to becoming a {roadmap.role}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setRoadmap(null)}>
                  Generate New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-8">
                  {roadmap.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="relative pl-14">
                      {/* Timeline dot */}
                      <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                        milestone.completed 
                          ? 'bg-success border-success' 
                          : 'bg-background border-primary'
                      }`}>
                        {milestone.completed && (
                          <CheckCircle2 className="w-3 h-3 text-success-foreground absolute top-0.5 left-0.5" />
                        )}
                      </div>
                      
                      <div className="p-4 rounded-lg bg-muted">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Week {milestone.week}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-foreground mb-1">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {milestone.skills.map(skill => (
                            <span 
                              key={skill}
                              className="text-xs px-2 py-1 rounded bg-accent/10 text-accent"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="w-4 h-4" />
                          <span>{milestone.resources.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentCareer;
