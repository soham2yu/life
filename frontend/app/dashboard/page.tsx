'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [lifescore, setLifescore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);
      setUser(firebaseUser);

      try {
        const userData = await apiRequest('/auth/me', {}, idToken);
        
        try {
          const lifescoreData = await apiRequest('/lifescore/current', {}, idToken);
          setLifescore(lifescoreData);
        } catch (err) {
          console.log('No lifescore yet');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const calculateLifeScore = async () => {
    if (!token) return;
    
    try {
      const result = await apiRequest('/lifescore/calculate', {
        method: 'POST',
      }, token);
      setLifescore(result);
    } catch (err: any) {
      alert('Error calculating LifeScore: ' + err.message);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">LifeScore Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Cognitive Score</h3>
            <p className="text-3xl font-bold text-blue-600">
              {lifescore?.cognitive_score?.toFixed(1) || '--'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Portfolio Score</h3>
            <p className="text-3xl font-bold text-green-600">
              {lifescore?.portfolio_score?.toFixed(1) || '--'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Endorsement Score</h3>
            <p className="text-3xl font-bold text-purple-600">
              {lifescore?.endorsement_score?.toFixed(1) || '--'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Overall LifeScore</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-bold text-indigo-600">
                {lifescore?.composite_score?.toFixed(1) || '--'}
              </p>
              {lifescore?.rank && (
                <p className="text-sm text-gray-500 mt-2">
                  Rank: #{lifescore.rank} | Percentile: {lifescore.percentile?.toFixed(1)}%
                </p>
              )}
            </div>
            <button
              onClick={calculateLifeScore}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Calculate LifeScore
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/test/cognitive')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Take Cognitive Test</h3>
            <p className="text-gray-600">Test your problem-solving and reasoning abilities</p>
          </button>

          <button
            onClick={() => router.push('/portfolio')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-left"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Analyze Portfolio</h3>
            <p className="text-gray-600">Analyze your GitHub repositories and contributions</p>
          </button>
        </div>
      </div>
    </div>
  );
}
