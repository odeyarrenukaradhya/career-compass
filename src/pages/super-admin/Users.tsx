import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformStats } from '@/lib/data';
import { 
  Users, 
  Shield,
  GraduationCap,
  Crown
} from 'lucide-react';

const SuperAdminUsers = () => {
  const stats = getPlatformStats();

  // Mock user data
  const userGroups = [
    {
      role: 'Students',
      icon: <GraduationCap className="w-6 h-6" />,
      count: stats.totalStudents,
      color: 'student',
      description: 'Registered students taking assessments',
    },
    {
      role: 'TPO Admins',
      icon: <Shield className="w-6 h-6" />,
      count: stats.totalAdmins,
      color: 'admin',
      description: 'Training and placement officers',
    },
    {
      role: 'Super Admins',
      icon: <Crown className="w-6 h-6" />,
      count: 2,
      color: 'super-admin',
      description: 'Platform administrators',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            Platform user overview (read-only)
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {userGroups.map((group) => (
            <Card key={group.role} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  group.color === 'student' ? 'bg-student/10 text-student' :
                  group.color === 'admin' ? 'bg-admin/10 text-admin' :
                  'bg-super-admin/10 text-super-admin'
                }`}>
                  {group.icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground">{group.count}</h3>
                <p className="font-medium text-foreground">{group.role}</p>
                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Administrative controls for user management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Full user management features will be available in Phase 2.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Currently showing read-only statistics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminUsers;
