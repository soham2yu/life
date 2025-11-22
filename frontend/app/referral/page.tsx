'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Share2, Copy, Users, Trophy, Gift } from 'lucide-react';

export default function ReferralPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const referralLink = `https://lifescore.app/signup?ref=${user?.uid}`;

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
        const data = await apiRequest('/referral/stats', {}, idToken);
        setReferralData(data);
      } catch (err: any) {
        console.error('Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join LifeScore - The Global Proof of Real Ability',
        text: 'Discover your true skills with AI-powered assessments. Use my referral link to get started!',
        url: referralLink,
      });
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Referral Program...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-gray-900 shadow-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Referral Program
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Share LifeScore, Earn Rewards
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Invite friends to join the global talent revolution and unlock exclusive rewards for both of you.
          </p>
        </div>

        {/* Referral Link */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
          <h3 className="text-2xl font-bold mb-6 text-center">Your Referral Link</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <button
              onClick={copyReferralLink}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition font-semibold"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={shareReferral}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
          <p className="text-center text-gray-400 text-sm">
            Share this link with friends. They'll get a bonus, and so will you!
          </p>
        </div>

        {/* Stats */}
        {referralData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-blue-400 mb-2">{referralData.total_referrals}</div>
              <p className="text-gray-300">Total Referrals</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-yellow-400 mb-2">{referralData.successful_referrals}</div>
              <p className="text-gray-300">Successful Signups</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 text-center">
              <Gift className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-green-400 mb-2">{referralData.rewards_earned}</div>
              <p className="text-gray-300">Rewards Earned</p>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
          <h3 className="text-2xl font-bold mb-6 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h4 className="text-lg font-semibold mb-2">Share Your Link</h4>
              <p className="text-gray-300 text-sm">Send your unique referral link to friends, colleagues, or anyone interested in proving their skills.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h4 className="text-lg font-semibold mb-2">They Sign Up</h4>
              <p className="text-gray-300 text-sm">When they create an account using your link, complete onboarding, and take their first test.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h4 className="text-lg font-semibold mb-2">Both Get Rewards</h4>
              <p className="text-gray-300 text-sm">You both receive bonus test attempts, score boosts, or premium features as rewards.</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {referralData?.leaderboard && (
          <div className="bg-gray-900 rounded-lg border border-yellow-500/20">
            <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
              <h3 className="text-lg font-semibold">Top Referrers</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {referralData.leaderboard.map((referrer: any, index: number) => (
                <div key={referrer.user_id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-gray-300">#{index + 1}</span>
                    <div>
                      <p className="font-semibold text-white">{referrer.name}</p>
                      <p className="text-sm text-gray-400">{referrer.referrals} referrals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-yellow-400">{referrer.rewards} rewards</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards Info */}
        <div className="mt-8 bg-gray-900 rounded-lg p-8 border border-yellow-500/20">
          <h3 className="text-2xl font-bold mb-6 text-center">Referral Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">For You (Referrer)</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• 1 extra cognitive test attempt per referral</li>
                <li>• +10 LifeScore boost for every 5 referrals</li>
                <li>• Priority access to new features</li>
                <li>• Exclusive beta testing opportunities</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-400">For Your Friends</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Free premium account for 1 month</li>
                <li>• +25 bonus LifeScore on signup</li>
                <li>• Skip the line for certificate generation</li>
                <li>• Early access to advanced analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
