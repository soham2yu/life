'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Save, ArrowLeft, User, MapPin, Link as LinkIcon, Github, Linkedin } from 'lucide-react';

const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  github_username: z.string().optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().optional(),
  skills: z.string().optional(), // Will be split by comma
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      setUser(firebaseUser);

      try {
        const profileData = await api('/profile/me', { headers: { Authorization: `Bearer ${await firebaseUser.getIdToken()}` } });
        setProfile(profileData);

        // Set form values
        setValue('bio', profileData.bio || '');
        setValue('github_username', profileData.github_username || '');
        setValue('linkedin_url', profileData.linkedin_url || '');
        setValue('website_url', profileData.website_url || '');
        setValue('location', profileData.location || '');
        setValue('skills', profileData.skills ? profileData.skills.join(', ') : '');
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, setValue]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const updateData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [],
      };

      const updatedProfile = await apiRequest('/profile/me', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }, token);

      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.message.includes('Invalid authentication token') || err.message.includes('401')) {
        router.push('/login');
        return;
      }
      toast.error('Error updating profile: ' + err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-lg border border-yellow-500/20 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black text-2xl font-bold">
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.displayName || 'User'}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-800 text-white resize-none"
                placeholder="Tell us about yourself..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-400">{errors.bio.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub Username
                </label>
                <input
                  {...register('github_username')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-800 text-white"
                  placeholder="your-github-username"
                />
                {errors.github_username && (
                  <p className="mt-1 text-sm text-red-400">{errors.github_username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </label>
                <input
                  {...register('location')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-800 text-white"
                  placeholder="City, Country"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn URL
                </label>
                <input
                  {...register('linkedin_url')}
                  type="url"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-800 text-white"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                {errors.linkedin_url && (
                  <p className="mt-1 text-sm text-red-400">{errors.linkedin_url.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Website URL
                </label>
                <input
                  {...register('website_url')}
                  type="url"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-800 text-white"
                  placeholder="https://yourwebsite.com"
                />
                {errors.website_url && (
                  <p className="mt-1 text-sm text-red-400">{errors.website_url.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skills (comma-separated)
              </label>
              <input
                {...register('skills')}
                type="text"
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-800 text-white"
                placeholder="JavaScript, React, Python, etc."
              />
              {errors.skills && (
                <p className="mt-1 text-sm text-red-400">{errors.skills.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 disabled:bg-yellow-300 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
