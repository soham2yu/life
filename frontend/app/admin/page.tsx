'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Users, FileText, TrendingUp, Shield, AlertTriangle, Settings } from 'lucide-react';

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);
      setUser(firebaseUser);

      // Check if user is admin
      try {
        const userData = await apiRequest('/auth/me', {}, idToken);
        if (!userData.is_admin) {
          router.push('/dashboard');
          return;
        }

        fetchAdminData();
      } catch (err) {
        router.push('/dashboard');
      }
    };

    init();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      const statsData = await apiRequest('/admin/stats', {}, token);
      setStats(statsData);

      const usersData = await apiRequest('/admin/users', {}, token);
      setUsers(usersData);

      const testsData = await apiRequest('/admin/tests', {}, token);
      setTests(testsData);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const overrideScore = async (userId: string, newScore: number) => {
    try {
      await apiRequest('/admin/override-score', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, score: newScore }),
      }, token);
      fetchAdminData(); // Refresh data
    } catch (err: any) {
      alert('Error overriding score: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Admin Panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-gray-900 shadow-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg border border-yellow-500/20">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'tests', label: 'Tests', icon: FileText },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.total_users}</p>
                  <p className="text-sm text-gray-400">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.total_tests}</p>
                  <p className="text-sm text-gray-400">Tests Taken</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.avg_lifescore?.toFixed(1)}</p>
                  <p className="text-sm text-gray-400">Avg LifeScore</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.fraud_flags}</p>
                  <p className="text-sm text-gray-400">Fraud Flags</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-900 rounded-lg border border-yellow-500/20">
            <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
              <h3 className="text-lg font-semibold">User Management</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {users.map((user) => (
                <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{user.name}</h4>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-500">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-300">Score: {user.lifescore?.toFixed(1) || '--'}</span>
                    <button
                      onClick={() => {
                        const newScore = prompt('Enter new LifeScore:');
                        if (newScore) overrideScore(user.id, parseFloat(newScore));
                      }}
                      className="px-3 py-1 bg-yellow-500 text-black rounded text-sm hover:bg-yellow-400 transition"
                    >
                      Override
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="bg-gray-900 rounded-lg border border-yellow-500/20">
            <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
              <h3 className="text-lg font-semibold">Test Management</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Test Statistics</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Total Tests: {tests.length}</p>
                    <p className="text-sm text-gray-400">Avg Score: {tests.reduce((acc, t) => acc + t.score, 0) / tests.length || 0}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Recent Tests</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {tests.slice(0, 5).map((test: any) => (
                      <div key={test.id} className="text-sm text-gray-300">
                        {test.user_name} - Score: {test.score?.toFixed(1)} ({new Date(test.completed_at).toLocaleDateString()})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
              <h3 className="text-lg font-semibold mb-4">Fraud Detection</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-semibold">Suspicious Test Patterns</p>
                    <p className="text-sm text-gray-400">Users with unusual test completion times</p>
                  </div>
                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">12 flagged</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-semibold">IP Address Anomalies</p>
                    <p className="text-sm text-gray-400">Multiple accounts from same IP</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm">8 flagged</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
              <h3 className="text-lg font-semibold mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">99.9%</p>
                  <p className="text-sm text-gray-400">Uptime</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">1.2s</p>
                  <p className="text-sm text-gray-400">Avg Response</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">45</p>
                  <p className="text-sm text-gray-400">Active Sessions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
            <h3 className="text-lg font-semibold mb-6">System Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Test Difficulty Scaling</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>Adaptive</option>
                  <option>Fixed</option>
                  <option>Progressive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fraud Detection Sensitivity</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="7"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Certificate Issuance</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="cert" className="mr-2" defaultChecked />
                    Automatic
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="cert" className="mr-2" />
                    Manual Review
                  </label>
                </div>
              </div>
              <button className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-semibold">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
