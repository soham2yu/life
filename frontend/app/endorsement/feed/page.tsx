'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Users, Plus, ThumbsUp, MessageCircle, UserCheck } from 'lucide-react';

export default function EndorsementFeedPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [endorsements, setEndorsements] = useState<any[]>([]);
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

      fetchEndorsements();
    };

    init();
  }, [router]);

  const fetchEndorsements = async () => {
    try {
      const data = await apiRequest('/endorsement/feed', {}, token);
      setEndorsements(data);
    } catch (err: any) {
      console.error('Error fetching endorsements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndorse = async (endorsementId: string) => {
    try {
      await apiRequest(`/endorsement/${endorsementId}/verify`, {
        method: 'POST',
      }, token);
      fetchEndorsements(); // Refresh the feed
    } catch (err: any) {
      alert('Error verifying endorsement: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Endorsement Feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-gray-900 shadow-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Endorsement Feed
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/endorsement')}
                className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
              >
                My Endorsements
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Community Endorsements
          </h2>
          <p className="text-xl text-gray-300">
            Verify skills and traits endorsed by your peers
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {endorsements.filter(e => e.status === 'pending').length}
            </div>
            <p className="text-gray-300">Pending Reviews</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 text-center">
            <UserCheck className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-green-400 mb-2">
              {endorsements.filter(e => e.status === 'verified').length}
            </div>
            <p className="text-gray-300">Verified</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 text-center">
            <ThumbsUp className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {endorsements.length}
            </div>
            <p className="text-gray-300">Total Endorsements</p>
          </div>
        </div>

        {/* Endorsement Feed */}
        <div className="space-y-6">
          {endorsements.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Endorsements Yet</h3>
              <p className="text-gray-400 mb-6">When people endorse your skills, they'll appear here for verification.</p>
              <button
                onClick={() => router.push('/profile/' + user?.uid)}
                className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-400 transition"
              >
                View My Profile
              </button>
            </div>
          ) : (
            endorsements.map((endorsement) => (
              <div key={endorsement.id} className="bg-gray-900 rounded-lg p-6 border border-yellow-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold">
                      {endorsement.endorser_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{endorsement.endorser_name}</h4>
                      <p className="text-sm text-gray-400">{endorsement.relationship}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    endorsement.status === 'verified'
                      ? 'bg-green-900/20 text-green-400 border border-green-500/20'
                      : endorsement.status === 'pending'
                      ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20'
                      : 'bg-red-900/20 text-red-400 border border-red-500/20'
                  }`}>
                    {endorsement.status}
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="text-lg font-semibold text-yellow-400 mb-2">
                    {endorsement.skill || endorsement.trait}
                  </h5>
                  {endorsement.comment && (
                    <p className="text-gray-300 italic">"{endorsement.comment}"</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Endorsed on {new Date(endorsement.created_at).toLocaleDateString()}
                  </div>

                  {endorsement.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEndorse(endorsement.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Verify</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        <MessageCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Endorsement CTA */}
        <div className="mt-12 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Endorse Someone's Skills</h3>
          <p className="mb-6">Help build a more accurate talent ecosystem by endorsing the skills you know.</p>
          <button
            onClick={() => router.push('/endorsement')}
            className="bg-black text-yellow-400 px-8 py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
          >
            Create Endorsement
          </button>
        </div>
      </div>
    </div>
  );
}
