'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { TrendingUp, Users, Award, Star, ThumbsUp } from 'lucide-react';

export default function EndorsementScorePage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [endorsementData, setEndorsementData] = useState<any>(null);
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
        const data = await apiRequest('/endorsement/score', {}, idToken);
        setEndorsementData(data);
      } catch (err: any) {
        console.error('Error fetching endorsement score:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Endorsement Score...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-gray-900 shadow-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Endorsement Score Analysis
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
        {endorsementData && (
          <>
            {/* Overall Score */}
            <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-4">Your Endorsement Score</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
                  {endorsementData.overall_score?.toFixed(1)}
                </div>
                <p className="text-gray-400">Out of 1000 points</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {endorsementData.total_endorsements || 0}
                  </div>
                  <p className="text-gray-300">Total Endorsements</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <ThumbsUp className="w-8 h-8 text-green-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {endorsementData.verified_endorsements || 0}
                  </div>
                  <p className="text-gray-300">Verified</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {endorsementData.unique_endorsers || 0}
                  </div>
                  <p className="text-gray-300">Unique Endorsers</p>
                </div>
              </div>
            </div>

            {/* Trust Score Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
                <h3 className="text-xl font-bold mb-6">Trust Score Factors</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Endorser Reputation</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: `${endorsementData.trust_factors?.endorser_reputation || 0}%`}}></div>
                      </div>
                      <span className="text-sm font-semibold">{endorsementData.trust_factors?.endorser_reputation || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Relationship Strength</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: `${endorsementData.trust_factors?.relationship_strength || 0}%`}}></div>
                      </div>
                      <span className="text-sm font-semibold">{endorsementData.trust_factors?.relationship_strength || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Verification Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${endorsementData.trust_factors?.verification_rate || 0}%`}}></div>
                      </div>
                      <span className="text-sm font-semibold">{endorsementData.trust_factors?.verification_rate || 0}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Diversity Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: `${endorsementData.trust_factors?.diversity_score || 0}%`}}></div>
                      </div>
                      <span className="text-sm font-semibold">{endorsementData.trust_factors?.diversity_score || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
                <h3 className="text-xl font-bold mb-6">Top Endorsed Skills</h3>
                <div className="space-y-3">
                  {endorsementData.top_skills?.map((skill: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{skill.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{skill.count} endorsements</span>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${skill.score}%`}}></div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-400">No skills endorsed yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Endorsements */}
            {endorsementData.recent_endorsements && endorsementData.recent_endorsements.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20 mb-8">
                <h3 className="text-xl font-bold mb-6">Recent Endorsements</h3>
                <div className="space-y-4">
                  {endorsementData.recent_endorsements.map((endorsement: any) => (
                    <div key={endorsement.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{endorsement.skill || endorsement.trait}</h4>
                          <p className="text-sm text-gray-400">by {endorsement.endorser_name} • {endorsement.relationship}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          endorsement.status === 'verified'
                            ? 'bg-green-900/20 text-green-400'
                            : 'bg-yellow-900/20 text-yellow-400'
                        }`}>
                          {endorsement.status}
                        </div>
                      </div>
                      {endorsement.comment && (
                        <p className="text-sm text-gray-300 italic">"{endorsement.comment}"</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(endorsement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Suggestions */}
            <div className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
              <h3 className="text-xl font-bold mb-6 text-yellow-400">Improve Your Endorsement Score</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Get More Endorsements</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Share your profile publicly</li>
                    <li>• Ask colleagues for skill endorsements</li>
                    <li>• Participate in team projects</li>
                    <li>• Contribute to open source</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Increase Trust Score</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Get endorsements from high-reputation users</li>
                    <li>• Build relationships with verified professionals</li>
                    <li>• Maintain consistent skill development</li>
                    <li>• Verify endorsements promptly</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center mt-8">
              <button
                onClick={() => router.push('/endorsement/feed')}
                className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg mr-4"
              >
                View Endorsement Feed
              </button>
              <button
                onClick={() => router.push('/endorsement/verify')}
                className="px-8 py-4 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
              >
                Endorse Someone
              </button>
            </div>
          </>
        )}

        {!endorsementData && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">No Endorsements Yet</h2>
            <p className="text-gray-400 mb-8">Start building your social proof by getting endorsed for your skills.</p>
            <button
              onClick={() => router.push('/endorsement/verify')}
              className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition"
            >
              Get Your First Endorsement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
