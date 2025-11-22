'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function LifeScorePage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [lifescore, setLifescore] = useState<any>(null);
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
        const data = await apiRequest('/lifescore/current', {}, idToken);
        setLifescore(data);
      } catch (err) {
        console.log('No lifescore yet');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const calculateLifeScore = async () => {
    try {
      const result = await apiRequest('/lifescore/calculate', {
        method: 'POST',
      }, token);
      setLifescore(result);
    } catch (err: any) {
      alert('Error calculating LifeScore: ' + err.message);
    }
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
              LifeScore Calculation
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            How Your LifeScore is Calculated
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A transparent breakdown of your cognitive abilities, portfolio quality, and social endorsements.
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
          <h3 className="text-2xl font-bold mb-6 text-center">Formula Overview</h3>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
              LifeScore
            </div>
            <div className="text-2xl text-gray-300">
              = (50% × Cognitive) + (30% × Portfolio) + (20% × Endorsements)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-blue-500/20">
              <div className="text-3xl font-bold text-blue-400 mb-2">50%</div>
              <h4 className="text-lg font-semibold mb-2">Cognitive Score</h4>
              <p className="text-gray-300 text-sm">
                Measures logical reasoning, problem-solving, memory, creativity, and learning ability through adaptive tests.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-green-500/20">
              <div className="text-3xl font-bold text-green-400 mb-2">30%</div>
              <h4 className="text-lg font-semibold mb-2">Portfolio Score</h4>
              <p className="text-gray-300 text-sm">
                Evaluates code quality, project complexity, consistency, and real-world impact from GitHub and other platforms.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-400 mb-2">20%</div>
              <h4 className="text-lg font-semibold mb-2">Endorsement Score</h4>
              <p className="text-gray-300 text-sm">
                Weighted trust score from verified endorsements for skills, behavior, and project contributions.
              </p>
            </div>
          </div>
        </div>

        {lifescore && (
          <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
            <h3 className="text-2xl font-bold mb-6 text-center">Your Current Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {lifescore.cognitive_score?.toFixed(1) || '--'}
                </div>
                <p className="text-gray-300">Cognitive</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {lifescore.portfolio_score?.toFixed(1) || '--'}
                </div>
                <p className="text-gray-300">Portfolio</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {lifescore.endorsement_score?.toFixed(1) || '--'}
                </div>
                <p className="text-gray-300">Endorsements</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center border-2 border-yellow-500">
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
                  {lifescore.composite_score?.toFixed(1) || '--'}
                </div>
                <p className="text-gray-300">LifeScore</p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Weight Impact Visualization</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cognitive (50%)</span>
                    <span>{lifescore.cognitive_score ? (lifescore.cognitive_score * 0.5).toFixed(1) : '--'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '50%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Portfolio (30%)</span>
                    <span>{lifescore.portfolio_score ? (lifescore.portfolio_score * 0.3).toFixed(1) : '--'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '30%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Endorsements (20%)</span>
                    <span>{lifescore.endorsement_score ? (lifescore.endorsement_score * 0.2).toFixed(1) : '--'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '20%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={calculateLifeScore}
            className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Calculate LifeScore
          </button>
        </div>
      </div>
    </div>
  );
}
