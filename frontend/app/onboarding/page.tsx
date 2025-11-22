'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    goals: [] as string[],
    experience_years: '',
    primary_skills: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const roles = ['Student', 'Developer', 'Designer', 'Data Scientist', 'Product Manager', 'Other'];
  const goals = ['Job Search', 'Internship', 'Skill Development', 'Personal Growth', 'Networking'];
  const skills = ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'AI/ML', 'Blockchain', 'UI/UX', 'DevOps'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      setUser(firebaseUser);
      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);
    });

    return () => unsubscribe();
  }, [router]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await apiRequest('/auth/onboard', {
        method: 'POST',
        body: JSON.stringify(formData),
      }, token);
      router.push('/dashboard');
    } catch (err: any) {
      alert('Error completing onboarding: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (field: 'goals' | 'primary_skills', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-gray-900 rounded-lg shadow-2xl p-8 border border-yellow-500/20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Welcome to LifeScore!
          </h1>
          <p className="text-center text-gray-300">Let's set up your profile to get the most accurate assessments.</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= num ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'
                }`}>
                  {num}
                </div>
                {num < 4 && <div className={`w-16 h-1 ${step > num ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">What's your name?</h2>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white text-lg"
              placeholder="Enter your full name"
              required
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">What's your role?</h2>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => setFormData({...formData, role})}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.role === role
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">What are your goals?</h2>
            <div className="grid grid-cols-2 gap-3">
              {goals.map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleSelection('goals', goal)}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.goals.includes(goal)
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Tell us about your experience</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <select
                value={formData.experience_years}
                onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
              >
                <option value="">Select experience level</option>
                <option value="0">Less than 1 year</option>
                <option value="1">1-2 years</option>
                <option value="3">3-5 years</option>
                <option value="6">6-10 years</option>
                <option value="11">More than 10 years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Primary Skills</label>
              <div className="grid grid-cols-3 gap-2">
                {skills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSelection('primary_skills', skill)}
                    className={`p-2 rounded-lg border transition text-sm ${
                      formData.primary_skills.includes(skill)
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                        : 'border-gray-700 hover:border-gray-600 text-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading || (step === 1 && !formData.name) || (step === 2 && !formData.role)}
            className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition disabled:bg-yellow-700 font-semibold ml-auto"
          >
            {loading ? 'Completing...' : step === 4 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
