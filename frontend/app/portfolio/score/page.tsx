'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { TrendingUp, Code, Star, GitBranch, Calendar, Award } from 'lucide-react';

export default function PortfolioScorePage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

      try {
        const data = await apiRequest('/portfolio/score', {}, idToken);
        setPortfolioData(data);
      } catch (err: any) {
        console.error('Error fetching portfolio score:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Portfolio Score...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-gray-900 shadow-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Portfolio Score Analysis
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
        {portfolioData && (
          <>
            {/* Overall Score */}
            <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-4">Your Portfolio Score</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
                  {portfolioData.overall_score?.toFixed(1)}
                </div>
                <p className="text-gray-400">Out of 1000 points</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">{portfolioData.quality_score?.toFixed(1)}</div>
                  <p className="text-sm text-gray-400">Code Quality</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">{portfolioData.consistency_score?.toFixed(1)}</div>
                  <p className="text-sm text-gray-400">Consistency</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-400">{portfolioData.impact_score?.toFixed(1)}</div>
                  <p className="text-sm text-gray-400">Impact</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">{portfolioData.complexity_score?.toFixed(1)}</div>
                  <p className="text-sm text-gray-400">Complexity</p>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* GitHub Metrics */}
              <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <GitBranch className="w-6 h-6 mr-3 text-yellow-500" />
                  GitHub Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Repositories</span>
                    <span className="font-semibold">{portfolioData.github_metrics?.total_repos || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stars Earned</span>
                    <span className="font-semibold">{portfolioData.github_metrics?.total_stars || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Commits</span>
                    <span className="font-semibold">{portfolioData.github_metrics?.total_commits || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Age</span>
                    <span className="font-semibold">{portfolioData.github_metrics?.account_age_days || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Primary Languages</span>
                    <span className="font-semibold">{portfolioData.github_metrics?.languages?.join(', ') || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
                <h3 className="text-xl font-bold mb-6 text-yellow-400">AI Recommendations</h3>
                <div className="space-y-4">
                  {portfolioData.recommendations?.map((rec: any, index: number) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">{rec.title}</h4>
                      <p className="text-sm text-gray-400">{rec.description}</p>
                      <div className="mt-2 text-xs text-yellow-400">
                        Potential Impact: +{rec.impact_score} points
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-400">No recommendations available yet. Complete more portfolio analysis to get personalized suggestions.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Repositories */}
            {portfolioData.repositories && portfolioData.repositories.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
                <h3 className="text-xl font-bold mb-6">Top Performing Repositories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolioData.repositories.slice(0, 6).map((repo: any) => (
                    <div key={repo.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{repo.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm">{repo.stars}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{repo.description || 'No description'}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{repo.primary_language}</span>
                        <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 text-xs text-green-400">
                        Score: {repo.score?.toFixed(1)}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="text-center mt-8">
              <button
                onClick={() => router.push('/portfolio')}
                className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg mr-4"
              >
                Analyze More Repositories
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
              >
                Back to Dashboard
              </button>
            </div>
          </>
        )}

        {!portfolioData && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-4">No Portfolio Data Yet</h2>
            <p className="text-gray-400 mb-8">Connect your GitHub profile to get detailed portfolio scoring and recommendations.</p>
            <button
              onClick={() => router.push('/portfolio/setup')}
              className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition"
            >
              Setup Portfolio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
