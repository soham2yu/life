'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function CertificatePage() {
  const [token, setToken] = useState('');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    certificate_url: '',
    description: '',
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
        const data = await apiRequest('/certificate/list', {}, idToken);
        setCertificates(data);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);

    try {
      const data = await apiRequest('/certificate/upload', {
        method: 'POST',
        body: JSON.stringify(uploadForm),
      }, token);

      setCertificates([...certificates, data]);
      setUploadForm({
        title: '',
        issuer: '',
        issue_date: '',
        certificate_url: '',
        description: '',
      });
      alert('Certificate uploaded successfully!');
    } catch (err: any) {
      alert('Error uploading certificate: ' + err.message);
    } finally {
      setUploadLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
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
          {/* Upload Certificate */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Certificate</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Title
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="e.g., AWS Certified Developer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuer
                </label>
                <input
                  type="text"
                  value={uploadForm.issuer}
                  onChange={(e) => setUploadForm({ ...uploadForm, issuer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="e.g., Amazon Web Services"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={uploadForm.issue_date}
                  onChange={(e) => setUploadForm({ ...uploadForm, issue_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate URL (Optional)
                </label>
                <input
                  type="url"
                  value={uploadForm.certificate_url}
                  onChange={(e) => setUploadForm({ ...uploadForm, certificate_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  rows={3}
                  placeholder="Brief description of the certificate..."
                />
              </div>
              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {uploadLoading ? 'Uploading...' : 'Upload Certificate'}
              </button>
            </form>
          </div>

          {/* Certificates List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Certificates</h2>
            {certificates.length === 0 ? (
              <p className="text-gray-600">No certificates uploaded yet. Add your first certificate!</p>
            ) : (
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                        <p className="text-sm text-gray-600">Issued by {cert.issuer}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(cert.issue_date).toLocaleDateString()}
                      </span>
                    </div>
                    {cert.description && (
                      <p className="text-gray-700 text-sm mb-2">{cert.description}</p>
                    )}
                    {cert.certificate_url && (
                      <a
                        href={cert.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        View Certificate →
                      </a>
                    )}
                    <div className="mt-2">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Verified
                      </span>
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
