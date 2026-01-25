import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GraduationCap, 
  Shield, 
  Crown, 
  ArrowRight, 
  CheckCircle2,
  BarChart3,
  FileQuestion,
  Users,
  Sparkles
} from 'lucide-react';
import { UserRole } from '@/lib/auth';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const routes: Record<UserRole, string> = {
        student: '/student/dashboard',
        admin: '/admin/dashboard',
        'super-admin': '/super-admin/dashboard',
      };
      navigate(routes[user.role]);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = (role: UserRole) => {
    login(role);
    const routes: Record<UserRole, string> = {
      student: '/student/dashboard',
      admin: '/admin/dashboard',
      'super-admin': '/super-admin/dashboard',
    };
    navigate(routes[role]);
  };

  const features = [
    {
      icon: <FileQuestion className="w-6 h-6" />,
      title: 'Smart Assessments',
      description: 'Take skill-based quizzes with real-time monitoring and instant feedback',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Progress Tracking',
      description: 'Monitor your performance and identify areas for improvement',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Career Mapping',
      description: 'Get personalized career roadmaps based on your goals and skills',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'TPO Management',
      description: 'Comprehensive tools for training and placement officers',
    },
  ];

  const roleCards = [
    {
      role: 'student' as UserRole,
      icon: <GraduationCap className="w-8 h-8" />,
      title: 'Student',
      description: 'Take assessments, track progress, and plan your career',
      color: 'student',
      features: ['Attempt quizzes', 'View results', 'Career roadmap'],
    },
    {
      role: 'admin' as UserRole,
      icon: <Shield className="w-8 h-8" />,
      title: 'TPO Admin',
      description: 'Create quizzes, monitor students, and manage placements',
      color: 'admin',
      features: ['Create quizzes', 'Monitor attempts', 'View analytics'],
    },
    {
      role: 'super-admin' as UserRole,
      icon: <Crown className="w-8 h-8" />,
      title: 'Super Admin',
      description: 'Full system oversight and administrative controls',
      color: 'super-admin',
      features: ['System overview', 'User management', 'Platform reports'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => handleLogin('student')}>
              Sign In
            </Button>
            <Button onClick={() => handleLogin('student')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Your Gateway to Career Success</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
            Master Your Skills,{' '}
            <span className="text-gradient">Land Your Dream Job</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in">
            PlacePro is the complete placement guidance platform for students and institutions. 
            Assess skills, track progress, and accelerate your career journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button size="lg" className="gap-2" onClick={() => handleLogin('student')}>
              Start as Student
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleLogin('admin')}>
              TPO Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A comprehensive platform designed to bridge the gap between education and employment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow animate-fade-in">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Portal</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select your role to access the right dashboard and features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roleCards.map((card) => (
              <Card 
                key={card.role}
                className="group cursor-pointer bg-card border-border hover:border-primary hover:shadow-xl transition-all duration-300 animate-fade-in"
                onClick={() => handleLogin(card.role)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    card.color === 'student' ? 'bg-student/10 text-student' :
                    card.color === 'admin' ? 'bg-admin/10 text-admin' :
                    'bg-super-admin/10 text-super-admin'
                  }`}>
                    {card.icon}
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {card.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6 group-hover:gradient-primary group-hover:text-primary-foreground transition-all" 
                    variant="outline"
                  >
                    Continue as {card.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2026 PlacePro. Built for career success.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
