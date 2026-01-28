import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileQuestion, 
  PlusCircle, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Trophy,
  Map,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Quizzes', href: '/student/quizzes', icon: <FileQuestion className="w-5 h-5" /> },
  { label: 'My Results', href: '/student/results', icon: <Trophy className="w-5 h-5" /> },
  { label: 'Career Map', href: '/student/career', icon: <Map className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'All Quizzes', href: '/admin/quizzes', icon: <FileQuestion className="w-5 h-5" /> },
  { label: 'Create Quiz', href: '/admin/quizzes/create', icon: <PlusCircle className="w-5 h-5" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
];

const superAdminNavItems: NavItem[] = [
  { label: 'Overview', href: '/super-admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'All Quizzes', href: '/super-admin/quizzes', icon: <FileQuestion className="w-5 h-5" /> },
  { label: 'Users', href: '/super-admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Reports', href: '/super-admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Settings', href: '/super-admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'student':
        return studentNavItems;
      case 'admin':
        return adminNavItems;
      case 'super_admin':
        return superAdminNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'student':
        return 'bg-student/10 text-student';
      case 'admin':
        return 'bg-admin/10 text-admin';
      case 'super_admin':
        return 'bg-super-admin/10 text-super-admin';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'admin':
        return 'TPO Admin';
      case 'super_admin':
        return 'Super Admin';
      default:
        return 'User';
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Logo size="sm" showText={!collapsed} />
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* User info */}
        <div className={cn(
          "p-4 border-b border-border",
          collapsed && "flex justify-center"
        )}>
          {!collapsed ? (
            <div className="space-y-2">
              <p className="font-semibold text-foreground truncate">{displayName}</p>
              <span className={cn("px-2 py-1 text-xs font-medium rounded-full", getRoleBadgeClass())}>
                {getRoleLabel()}
              </span>
            </div>
          ) : (
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", getRoleBadgeClass())}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                {item.icon}
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              collapsed ? "px-2 justify-center" : "justify-start"
            )}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome back, <span className="font-medium text-foreground">{displayName.split(' ')[0]}</span>
            </span>
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
