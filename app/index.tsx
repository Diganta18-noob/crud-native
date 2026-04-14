import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader';

export default function Index() {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/(auth)/login');
    } else if (isAdmin) {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(user)/home');
    }
  }, [user, isLoading, isAdmin]);

  return <Loader />;
}
