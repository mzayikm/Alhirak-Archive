import AuthGate from '@/components/AuthGate';
import HomeContent from '@/components/HomeContent';

export default function HomePage() {
  return (
    <AuthGate>
      <HomeContent />
    </AuthGate>
  );
}