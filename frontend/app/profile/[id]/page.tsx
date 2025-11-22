'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { Share2, Download, ExternalLink, Award, TrendingUp, Users, Code } from 'lucide-react';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [lifescore, setLifescore] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const firebaseUser = auth.currentUser;
      setCurrentUser(firebaseUser);

      try {
        // Fetch public profile data
        const profileData = await apiRequest(`/profile/user/${userId}`);
        setProfile(profileData);

        const lifescoreData = await apiRequest(`/lifescore/user/${userId}`);
        setLifescore(lifescoreData);

        const portfolioData = await apiRequest(`/portfolio/user/${userId}`);
        setPortfolio(portfolioData);

        const endorsementsData = await apiRequest(`/endorsement/user/${userId}`);
        setEndorsements(endorsementsData);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      init();
    }
  }, [userId]);

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name}'s LifeScore Profile`,
        text: `Check out ${profile?.name}'s verified skills and achievements on LifeScore`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black text-2xl font-bold">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                <p className="text-xl text-gray-300 mb-1">{profile.role}</p>
                <p className="text-gray-400">{profile.bio || 'No bio available'}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={shareProfile}
                className="flex items-center space-x-2 px-4 py-2 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              {currentUser?.uid === userId && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* LifeScore Overview */}
        {lifescore && (
          <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4">LifeScore</h2>
              <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
                {lifescore.composite_score?.toFixed(1)}
              </div>
              <p className="text-gray-400">Global Rank #{lifescore.rank || 'Unranked'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {lifescore.cognitive_score?.toFixed(1)}
                </div>
                <p className="text-gray-300">Cognitive</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {lifescore.portfolio_score?.toFixed(1)}
                </div>
                <p className="text-gray-300">Portfolio</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {lifescore.endorsement_score?.toFixed(1)}
                </div>
                <p className="text-gray-300">Endorsements</p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Highlights */}
        {portfolio && (
          <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Code className="w-6 h-6 mr-3 text-yellow-500" />
              Portfolio Highlights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {portfolio.total_repos || 0}
                </div>
                <p className="text-gray-300">Repositories</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {portfolio.total_stars || 0}
                </div>
                <p className="text-gray-300">Stars</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {portfolio.total_commits || 0}
                </div>
                <p className="text-gray-300">Commits</p>
              </div>
            </div>

            {portfolio.repositories && portfolio.repositories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Top Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.repositories.slice(0, 4).map((repo: any) => (
                    <div key={repo.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{repo.repo_name}</h4>
                        <span className="text-sm text-gray-400">⭐ {repo.stars}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{repo.description || 'No description'}</p>
                      {repo.primary_language && (
                        <span className="inline-block px-2 py-1 bg-gray-700 text-xs rounded-full text-gray-300">
                          {repo.primary_language}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Endorsements */}
        {endorsements && endorsements.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-yellow-500" />
              Endorsements ({endorsements.length})
            </h2>

            <div className="space-y-4">
              {endorsements.slice(0, 5).map((endorsement: any) => (
                <div key={endorsement.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-white">{endorsement.skill || endorsement.trait}</p>
                      <p className="text-sm text-gray-300">by {endorsement.endorser_name || 'Anonymous'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-400">{endorsement.relationship}</span>
                    </div>
                  </div>
                  {endorsement.comment && (
                    <p className="text-sm text-gray-300 italic">"{endorsement.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Section */}
        {lifescore && (
          <div className="bg-gray-900 rounded-lg p-8 border border-yellow-500/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Award className="w-6 h-6 mr-3 text-yellow-500" />
              Certificate
            </h2>

            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-lg mb-6">
                <h3 className="text-2xl font-bold mb-2">LifeScore Certificate</h3>
                <p className="text-lg mb-4">Awarded to {profile.name}</p>
                <div className="text-4xl font-bold mb-4">{lifescore.composite_score?.toFixed(1)}</div>
                <p className="text-sm">Issued on {new Date().toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition">
                  <Download className="w-4 h-4" />
                  <span>Download Certificate</span>
                </button>
                <button
                  onClick={() => router.push(`/certificate/verify?id=${userId}`)}
                  className="flex items-center space-x-2 px-6 py-3 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Verify Certificate</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
