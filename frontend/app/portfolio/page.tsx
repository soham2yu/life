'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function PortfolioPage() {
  const [token, setToken] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const idToken = await user.getIdToken();
      setToken(idToken);
    };

    init();
  }, [router]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await apiRequest('/portfolio/analyze-github', {
        method: 'POST',
        body: JSON.stringify({ github_username: githubUsername }),
      }, token);

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze GitHub profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Analysis</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Analyze GitHub Profile</h2>
          
          <form onSubmit={handleAnalyze} className="flex gap-4">
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Score</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Repo Quality</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.score.repo_quality_score.toFixed(1)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Activity</p>
                  <p className="text-2xl font-bold text-green-600">
                    {result.score.activity_score.toFixed(1)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Impact</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {result.score.impact_score.toFixed(1)}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Composite</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {result.score.composite_score.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">GitHub Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{result.metrics.total_repos}</p>
                  <p className="text-sm text-gray-600">Repositories</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{result.metrics.total_stars}</p>
                  <p className="text-sm text-gray-600">Stars</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{result.metrics.total_commits}</p>
                  <p className="text-sm text-gray-600">Commits</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{result.metrics.account_age_days}</p>
                  <p className="text-sm text-gray-600">Days Old</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Repositories</h3>
              <div className="space-y-3">
                {result.repositories.slice(0, 5).map((repo: any) => (
                  <div key={repo.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{repo.repo_name}</h4>
                        <p className="text-sm text-gray-600">{repo.description || 'No description'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">⭐ {repo.stars}</span>
                      </div>
                    </div>
                    {repo.primary_language && (
                      <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {repo.primary_language}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
