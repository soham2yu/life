'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function EndorsementPage() {
  const [token, setToken] = useState('');
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    email: '',
    message: '',
  });
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

      try {
        const data = await apiRequest('/endorsement/list', {}, idToken);
        setEndorsements(data);
      } catch (err) {
        console.error('Error fetching endorsements:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const handleRequestEndorsement = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);

    try {
      await apiRequest('/endorsement/request', {
        method: 'POST',
        body: JSON.stringify(requestForm),
      }, token);

      alert('Endorsement request sent successfully!');
      setRequestForm({ email: '', message: '' });
    } catch (err: any) {
      alert('Error sending request: ' + err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Endorsements</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Endorsement */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Endorsement</h2>
            <form onSubmit={handleRequestEndorsement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={requestForm.email}
                  onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="colleague@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  rows={4}
                  placeholder="Please provide an endorsement for my work..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={requestLoading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {requestLoading ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          </div>

          {/* Endorsements List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Endorsements</h2>
            {endorsements.length === 0 ? (
              <p className="text-gray-600">No endorsements yet. Request some from colleagues!</p>
            ) : (
              <div className="space-y-4">
                {endorsements.map((endorsement) => (
                  <div key={endorsement.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{endorsement.endorser_name}</h3>
                        <p className="text-sm text-gray-600">{endorsement.endorser_email}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(endorsement.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{endorsement.message}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-600">Skills: </span>
                      <div className="ml-2 flex flex-wrap gap-1">
                        {endorsement.skills?.map((skill: string) => (
                          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
