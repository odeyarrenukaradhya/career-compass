import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAttempts } from '@/lib/data';
import { 
  Users, 
  FileQuestion,
  Trophy,
  AlertTriangle
} from 'lucide-react';

const AdminStudents = () => {
  const attempts = getAttempts();
  
  // Group attempts by student
  const studentMap = new Map<string, typeof attempts>();
  attempts.forEach(attempt => {
    const existing = studentMap.get(attempt.studentId) || [];
    studentMap.set(attempt.studentId, [...existing, attempt]);
  });

  const students = Array.from(studentMap.entries()).map(([id, studentAttempts]) => {
    const totalScore = studentAttempts.reduce((acc, a) => acc + (a.score / a.totalQuestions) * 100, 0);
    const avgScore = Math.round(totalScore / studentAttempts.length);
    const totalViolations = studentAttempts.reduce((acc, a) => acc + a.violations.length, 0);
    
    return {
      id,
      name: studentAttempts[0].studentName,
      attempts: studentAttempts.length,
      avgScore,
      violations: totalViolations,
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            View student performance and activity
          </p>
        </div>

        {students.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Student Activity</h3>
              <p className="text-muted-foreground">
                Students will appear here after they attempt quizzes
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">Student ID: {student.id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 md:gap-8">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <FileQuestion className="w-4 h-4" />
                        </div>
                        <p className="text-xl font-bold text-foreground">{student.attempts}</p>
                        <p className="text-xs text-muted-foreground">Attempts</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <p className={`text-xl font-bold ${
                          student.avgScore >= 70 ? 'text-success' : 
                          student.avgScore >= 40 ? 'text-warning' : 
                          'text-destructive'
                        }`}>
                          {student.avgScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <p className={`text-xl font-bold ${
                          student.violations > 0 ? 'text-warning' : 'text-success'
                        }`}>
                          {student.violations}
                        </p>
                        <p className="text-xs text-muted-foreground">Violations</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminStudents;
