import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformStats, getAllQuizzes, getAttempts } from '@/lib/data';
import { 
  Users, 
  Shield,
  FileQuestion,
  BarChart3,
  TrendingUp,
  Activity,
  Server,
  Database
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const stats = getPlatformStats();
  const quizzes = getAllQuizzes();
  const attempts = getAttempts();

  const systemHealth = [
    { label: 'API Status', status: 'Operational', color: 'success' },
    { label: 'Database', status: 'Healthy', color: 'success' },
    { label: 'Auth Service', status: 'Active', color: 'success' },
    { label: 'Monitoring', status: 'Running', color: 'success' },
  ];

  const overviewStats = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: <Users className="w-6 h-6" />,
      change: '+12%',
      positive: true,
    },
    {
      label: 'Total Admins',
      value: stats.totalAdmins,
      icon: <Shield className="w-6 h-6" />,
      change: '+2',
      positive: true,
    },
    {
      label: 'Active Quizzes',
      value: stats.totalQuizzes,
      icon: <FileQuestion className="w-6 h-6" />,
      change: '+5',
      positive: true,
    },
    {
      label: 'Total Attempts',
      value: stats.totalAttempts,
      icon: <BarChart3 className="w-6 h-6" />,
      change: '+28%',
      positive: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">System Overview</h1>
          <p className="text-muted-foreground mt-1">
            Platform-wide statistics and system health
          </p>
        </div>

        {/* System Health */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-success" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {systemHealth.map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className={`w-2 h-2 rounded-full bg-${item.color} animate-pulse-soft`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                    <p className={`text-sm mt-1 flex items-center gap-1 ${
                      stat.positive ? 'text-success' : 'text-destructive'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.change} this month
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-super-admin/10 flex items-center justify-center text-super-admin">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Platform Metrics */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Platform Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-muted-foreground">Average Quiz Score</span>
                <span className="font-bold text-foreground">{stats.averageScore}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-muted-foreground">Active Quiz Rate</span>
                <span className="font-bold text-foreground">
                  {Math.round((quizzes.filter(q => q.isActive).length / quizzes.length) * 100) || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-bold text-foreground">87%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-muted-foreground">Student Engagement</span>
                <span className="font-bold text-foreground">High</span>
              </div>
            </CardContent>
          </Card>

          {/* Resource Usage */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Resource Usage
              </CardTitle>
              <CardDescription>System resource allocation (mock data)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium text-foreground">2.4 GB / 10 GB</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '24%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Database</span>
                  <span className="font-medium text-foreground">156 MB / 1 GB</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">API Calls (today)</span>
                  <span className="font-medium text-foreground">1,247 / 10,000</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
