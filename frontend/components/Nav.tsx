'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

export default function Nav() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navItems = [
    { name: 'Home', href: '/', public: true },
    { name: 'About', href: '/about', public: true },
    { name: 'Dashboard', href: '/dashboard', public: false },
    { name: 'Portfolio', href: '/portfolio', public: false },
    { name: 'Cognitive Test', href: '/test/cognitive', public: false },
    { name: 'Endorsements', href: '/endorsement', public: false },
    { name: 'Certificates', href: '/certificate', public: false },
    { name: 'Settings', href: '/settings', public: false },
  ];

  return (
    <nav className="bg-gray-900 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-yellow-400 hover:text-yellow-300"
              >
                LifeScore
              </button>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems
                  .filter(item => item.public || user)
                  .map((item) => (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                        pathname === item.href
                          ? 'bg-yellow-600 text-black'
                          : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-sm text-gray-300 ${user ? '' : 'hidden'}`}>
              Welcome, {user?.displayName || user?.email}
            </span>
            <button
              onClick={user ? handleSignOut : () => router.push('/login')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                user
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {user ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
