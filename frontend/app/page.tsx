'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Shield, Globe, TrendingUp, Award, Users } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
          >
            LifeScore – The Global Proof of Real Ability
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Replace static resumes with a dynamic, verified profile of your real skills.
            Measure creativity, adaptability, and problem-solving with AI-powered assessments.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => router.push('/login')}
              className="bg-yellow-500 text-black px-10 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-yellow-500 text-yellow-500 px-10 py-4 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black transition-all duration-300 transform hover:scale-105"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Problem Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        id="problem"
        className="py-24 bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-white mb-6">The Problem</h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Traditional education and hiring rely on degrees, grades, and resumes — all easy to fake and unable to measure true skills.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-700 p-10 rounded-xl shadow-2xl text-center hover:shadow-blue-500/20 transition-all duration-300"
            >
              <Award className="w-16 h-16 mx-auto mb-6 text-red-400" />
              <h3 className="text-2xl font-bold text-white mb-4">Fake Credentials</h3>
              <p className="text-gray-300 leading-relaxed">
                Degrees and certificates can be forged, leading to unqualified candidates in key positions.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-700 p-10 rounded-xl shadow-2xl text-center hover:shadow-blue-500/20 transition-all duration-300"
            >
              <TrendingUp className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white mb-4">Biased Hiring</h3>
              <p className="text-gray-300 leading-relaxed">
                Resumes don't capture real abilities like creativity, adaptability, or problem-solving.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gray-700 p-10 rounded-xl shadow-2xl text-center hover:shadow-blue-500/20 transition-all duration-300"
            >
              <Users className="w-16 h-16 mx-auto mb-6 text-green-400" />
              <h3 className="text-2xl font-bold text-white mb-4">Wasted Talent</h3>
              <p className="text-gray-300 leading-relaxed">
                Brilliant individuals are overlooked due to outdated evaluation methods.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Solution Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-400 mb-4">The Solution</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              LifeScore is a digital identity and proof-of-skill system that builds a living, verified profile of a person's real abilities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-blue-400 mb-6">How It Works</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">1</div>
                  <div>
                    <h4 className="font-semibold text-blue-400">AI Cognitive Tests</h4>
                    <p className="text-gray-300">Take adaptive tests measuring thinking speed, creativity, logic, and collaboration.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">2</div>
                  <div>
                    <h4 className="font-semibold text-blue-400">Portfolio Analysis</h4>
                    <p className="text-gray-300">Link certifications, projects, and experiences, verified by institutions or companies.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">3</div>
                  <div>
                    <h4 className="font-semibold text-blue-400">Dynamic LifeScore</h4>
                    <p className="text-gray-300">Calculate a dynamic score that evolves as you learn and work, stored securely on blockchain.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg">
              <div className="text-center">
                <div className="text-8xl mb-4">🚀</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Your Lifelong Learning Passport</h4>
                <p className="text-gray-700">
                  Think: LinkedIn + Duolingo + Blockchain = LifeScore
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 bg-gray-800 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-12"
          >
            Global Impact
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-16 max-w-4xl mx-auto leading-relaxed"
          >
            LifeScore replaces static resumes with a global, fair, proof-based talent identity, enabling smarter hiring, personalized education, and equal opportunities for all.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-700 p-10 rounded-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
            >
              <Shield className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">Smarter Hiring</h3>
              <p className="text-gray-300 leading-relaxed">Employers instantly verify authenticity and real skills.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-700 p-10 rounded-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
            >
              <Globe className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">Personalized Education</h3>
              <p className="text-gray-300 leading-relaxed">Universities tailor programs to individual strengths and needs.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gray-700 p-10 rounded-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
            >
              <Users className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h3 className="text-3xl font-bold text-yellow-400 mb-6">Equal Opportunities</h3>
              <p className="text-gray-300 leading-relaxed">Break down barriers and give everyone a fair chance to succeed.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Prove Your Real Abilities?</h2>
          <p className="text-xl mb-8">
            Join thousands of professionals building their verified skill profiles.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
          >
            Start Your LifeScore Journey
          </button>
        </div>
      </section>
    </div>
  );
}
