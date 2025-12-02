import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';
import FacultyDashboard from '@/components/FacultyDashboard';
import StudentDashboard from '@/components/StudentDashboard';

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  if (user?.role === 'faculty') {
    return <FacultyDashboard />;
  }

  return <StudentDashboard />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
