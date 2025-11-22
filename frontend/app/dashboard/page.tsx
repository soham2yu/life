'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Brain, Code, Users, TrendingUp, Award, Bell, Settings, LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [lifescore, setLifescore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
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

      const fetchData = async () => {
      try {
        const userData = await apiRequest('/auth/me', { headers: { Authorization: `Bearer ${idToken}` } });

        try {
          const lifescoreData = await api('/lifescore/current', { headers: { Authorization: `Bearer ${idToken}` } });
          setLifescore(lifescoreData);
        } catch (err) {
          console.log('No lifescore yet');
        }

        // Mock notifications - in real app, fetch from API
        setNotifications([
          { id: 1, type: 'portfolio', message: 'Portfolio analysis updated', time: '2 hours ago' },
          { id: 2, type: 'endorsement', message: 'New endorsement received', time: '1 day ago' },
          { id: 3, type: 'certificate', message: 'Certificate ready for download', time: '3 days ago' },
        ]);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        if (err.message.includes('Invalid authentication token') || err.message.includes('401')) {
          router.push('/login');
          return;
        }
      } finally {
        setLoading(false);
      }
      };

      fetchData();

      // Set up polling for real-time updates every 30 seconds
      const interval = setInterval(fetchData, 30000);

      return () => clearInterval(interval);
    });

    return () => unsubscribe();
  }, [router]);

  const calculateLifeScore = async () => {
    if (!token) return;

    try {
      const result = await apiRequest('/lifescore/calculate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-gray-900 shadow-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              LifeScore Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button className="relative">
                <Bell className="w-6 h-6 text-gray-300 hover:text-yellow-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/profile/edit')}
                className="text-gray-300 hover:text-yellow-400"
                title="Edit Profile"
              >
                <User className="w-6 h-6" />
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="text-gray-300 hover:text-yellow-400"
              >
                <Settings className="w-6 h-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-300 hover:text-red-400"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.displayName || 'User'}!</h2>
          <p className="text-gray-400">Here's your latest progress and quick actions.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Cognitive</p>
                <p className="text-2xl font-bold text-blue-400">
                  {lifescore?.cognitive_score?.toFixed(1) || '--'}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: `${lifescore?.cognitive_score || 0}%`}}></div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Portfolio</p>
                <p className="text-2xl font-bold text-green-400">
                  {lifescore?.portfolio_score?.toFixed(1) || '--'}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: `${lifescore?.portfolio_score || 0}%`}}></div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Endorsements</p>
                <p className="text-2xl font-bold text-purple-400">
                  {lifescore?.endorsement_score?.toFixed(1) || '--'}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: `${lifescore?.endorsement_score || 0}%`}}></div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border-2 border-yellow-500">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">LifeScore</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  {lifescore?.composite_score?.toFixed(1) || '--'}
                </p>
              </div>
            </div>
            {lifescore?.rank && (
              <p className="text-sm text-gray-400">
                Rank: #{lifescore.rank} | Top {lifescore.percentile?.toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        {/* Radar Chart Placeholder */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
          <h3 className="text-xl font-bold mb-6">Ability Dimensions</h3>
          <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Radar Chart - Logic, Math, Memory, Creativity, Speed, Learning</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push('/test/cognitive')}
            className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 hover:border-yellow-400 transition text-left group"
          >
            <Brain className="w-8 h-8 text-blue-400 mb-4 group-hover:text-blue-300" />
            <h3 className="text-lg font-bold mb-2">Take Test</h3>
            <p className="text-gray-400 text-sm">Assess your cognitive abilities</p>
          </button>

          <button
            onClick={() => router.push('/portfolio')}
            className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 hover:border-yellow-400 transition text-left group"
          >
            <Code className="w-8 h-8 text-green-400 mb-4 group-hover:text-green-300" />
            <h3 className="text-lg font-bold mb-2">Portfolio</h3>
            <p className="text-gray-400 text-sm">Analyze your GitHub projects</p>
          </button>

          <button
            onClick={() => router.push('/endorsement')}
            className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 hover:border-yellow-400 transition text-left group"
          >
            <Users className="w-8 h-8 text-purple-400 mb-4 group-hover:text-purple-300" />
            <h3 className="text-lg font-bold mb-2">Endorsements</h3>
            <p className="text-gray-400 text-sm">Manage skill endorsements</p>
          </button>

          <button
            onClick={() => router.push('/certificate')}
            className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 hover:border-yellow-400 transition text-left group"
          >
            <Award className="w-8 h-8 text-yellow-400 mb-4 group-hover:text-yellow-300" />
            <h3 className="text-lg font-bold mb-2">Certificate</h3>
            <p className="text-gray-400 text-sm">View your SBT certificate</p>
          </button>
        </div>

        {/* Progress Over Time Placeholder */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
          <h3 className="text-xl font-bold mb-6">Score Progress</h3>
          <div className="flex items-center justify-center h-48 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Line Chart - Score progression over time</p>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-gray-900 rounded-lg border border-yellow-500/20">
            <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {notifications.map((notification) => (
                <div key={notification.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      notification.type === 'portfolio' ? 'bg-green-400' :
                      notification.type === 'endorsement' ? 'bg-purple-400' :
                      'bg-yellow-400'
                    }`}></div>
                    <p className="text-gray-300">{notification.message}</p>
                  </div>
                  <span className="text-sm text-gray-500">{notification.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <div className="text-center mt-8">
          <button
            onClick={calculateLifeScore}
            className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Recalculate LifeScore
          </button>
        </div>
      </div>
    </div>
  );
}
