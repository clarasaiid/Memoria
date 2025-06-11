import { useState, useEffect } from 'react';

interface User {
  id: string;
  userName: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual auth logic
    setLoading(false);
  }, []);

  return { user, loading };
} 