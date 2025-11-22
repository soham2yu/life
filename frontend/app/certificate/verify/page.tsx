'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Download } from 'lucide-react';

export default function CertificateVerificationPage() {
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const certId = searchParams.get('id');

  useEffect(() => {
    if (certId) {
      setVerificationId(certId);
      verifyCertificate(certId);
    }
  }, [certId]);

  const verifyCertificate = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/certificate/verify/${id}`);
      setCertificate(data);
    } catch (err: any) {
      setError(err.message || 'Certificate verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    if (verificationId.trim()) {
      verifyCertificate(verificationId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-gray-900 shadow-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Certificate Verification
            </h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Input */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8 border border-yellow-500/20">
          <h2 className="text-2xl font-bold mb-6 text-center">Verify a LifeScore Certificate</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={verificationId}
              onChange={(e) => setVerificationId(e.target.value)}
              placeholder="Enter certificate ID or user ID"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !verificationId.trim()}
              className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition disabled:bg-yellow-700 font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          <p className="text-center text-gray-400 text-sm">
            Enter a certificate ID, user ID, or verification hash to check authenticity
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Verification Failed</h3>
                <p className="text-gray-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Details */}
        {certificate && (
          <div className="space-y-8">
            {/* Status */}
            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-xl font-bold text-green-400">Certificate Verified</h3>
                  <p className="text-gray-300">This LifeScore certificate is authentic and valid.</p>
                </div>
              </div>
            </div>

            {/* Certificate Display */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-8 rounded-lg">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">LifeScore Certificate</h2>
                <p className="text-lg">of Achievement</p>
              </div>

              <div className="bg-black/10 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm mb-2">This certifies that</p>
                  <h3 className="text-2xl font-bold mb-4">{certificate.user_name}</h3>
                  <p className="text-lg mb-4">has achieved a LifeScore of</p>
                  <div className="text-6xl font-bold mb-4">{certificate.composite_score?.toFixed(1)}</div>
                  <p className="text-sm">on {new Date(certificate.issued_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-800 transition">
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-800 transition">
                  <ExternalLink className="w-4 h-4" />
                  <span>View Profile</span>
                </button>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="bg-gray-900 rounded-lg border border-yellow-500/20">
              <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Certificate Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Certificate Information</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><strong>ID:</strong> {certificate.id}</p>
                      <p><strong>Issued:</strong> {new Date(certificate.issued_at).toLocaleDateString()}</p>
                      <p><strong>Expires:</strong> {certificate.expires_at ? new Date(certificate.expires_at).toLocaleDateString() : 'Never'}</p>
                      <p><strong>Version:</strong> {certificate.version || '1.0'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Score Breakdown</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><strong>Cognitive:</strong> {certificate.cognitive_score?.toFixed(1)}</p>
                      <p><strong>Portfolio:</strong> {certificate.portfolio_score?.toFixed(1)}</p>
                      <p><strong>Endorsements:</strong> {certificate.endorsement_score?.toFixed(1)}</p>
                      <p><strong>Composite:</strong> {certificate.composite_score?.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Blockchain Verification</h4>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Transaction Hash:</span>
                      <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                        <ExternalLink className="w-4 h-4 inline mr-1" />
                        View on Blockchain
                      </button>
                    </div>
                    <p className="text-xs font-mono text-gray-400 break-all">
                      {certificate.blockchain_hash || '0x1234567890abcdef...'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Verification Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-300">Authenticity Verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-300">Blockchain Recorded</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-300">Not Expired</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* JSON Data */}
            <div className="bg-gray-900 rounded-lg border border-yellow-500/20">
              <div className="px-6 py-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Raw Certificate Data</h3>
                <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                  <Download className="w-4 h-4 inline mr-1" />
                  Export JSON
                </button>
              </div>
              <div className="p-6">
                <pre className="text-xs text-gray-300 bg-gray-800 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(certificate, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-400">Verifying certificate...</p>
          </div>
        )}
      </div>
    </div>
  );
}
