'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

export default function LeaderboardPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    country: '',
    skill: '',
    age_group: '',
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const countries = ['All', 'India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'];
  const skills = ['All', 'JavaScript', 'Python', 'Java', 'AI/ML', 'Web Development', 'Mobile', 'Blockchain'];
  const ageGroups = ['All', '18-22', '23-30', '31-40', '41+'];

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

      fetchLeaderboard();
    };

    init();
  }, [router]);

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.country && filters.country !== 'All') params.append('country', filters.country);
      if (filters.skill && filters.skill !== 'All') params.append('skill', filters.skill);
      if (filters.age_group && filters.age_group !== 'All') params.append('age_group', filters.age_group);

      const data = await apiRequest(`/lifescore/leaderboard?${params.toString()}`, {}, token);
      setLeaderboard(data);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLeaderboard();
    }
  }, [filters, token]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-gray-900 shadow-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Global Leaderboard
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Top Performers Worldwide
          </h2>
          <p className="text-xl text-gray-300">
            See how you stack up against the best talent globally
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-yellow-500/20">
          <h3 className="text-lg font-semibold mb-4">Filter Rankings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
            >
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={filters.skill}
              onChange={(e) => setFilters({...filters, skill: e.target.value})}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
            >
              {skills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            <select
              value={filters.age_group}
              onChange={(e) => setFilters({...filters, age_group: e.target.value})}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
            >
              {ageGroups.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {leaderboard.slice(0, 3).map((entry, index) => {
              const rank = index + 1;
              const heights = ['h-32', 'h-40', 'h-24'];
              const colors = ['bg-gradient-to-t from-yellow-500 to-yellow-400', 'bg-gradient-to-t from-gray-400 to-gray-300', 'bg-gradient-to-t from-amber-600 to-amber-500'];
              
              return (
                <div key={entry.user_id} className={`bg-gray-900 rounded-lg p-6 border border-yellow-500/20 text-center ${heights[index]}`}>
                  <div className="flex justify-center mb-4">
                    {getRankIcon(rank)}
                  </div>
                  <div className={`w-16 h-16 ${colors[index]} rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-xl`}>
                    #{rank}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{entry.name || 'Anonymous'}</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
                    {entry.composite_score?.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-400">{entry.role || 'Professional'}</p>
                  {entry.country && <p className="text-xs text-gray-500">{entry.country}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-yellow-500/20">
          <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
            <h3 className="text-lg font-semibold">Full Rankings</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.user_id === user?.uid;
              
              return (
                <div key={entry.user_id} className={`px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition ${isCurrentUser ? 'bg-yellow-500/10 border-l-4 border-yellow-500' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(rank)}
                      <span className="text-lg font-semibold text-gray-300">#{rank}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{entry.name || 'Anonymous'}</h4>
                      <p className="text-sm text-gray-400">{entry.role || 'Professional'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                      {entry.composite_score?.toFixed(1)}
                    </p>
                    {entry.country && <p className="text-xs text-gray-500">{entry.country}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No rankings available for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
