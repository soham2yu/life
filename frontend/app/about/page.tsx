'use client';

import { motion } from 'framer-motion';
import { Target, Zap, Shield, Users, Brain, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
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
            About LifeScore
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Revolutionizing how the world measures and verifies real abilities through AI-powered assessments and blockchain-verified portfolios.
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              To create a global standard for proving real skills, replacing outdated resumes and degrees with dynamic, verifiable profiles of human potential.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-yellow-400 mb-8">Why LifeScore?</h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <Brain className="w-12 h-12 text-yellow-400 mr-6 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-400 text-xl mb-2">AI-Powered Assessments</h4>
                    <p className="text-gray-300 leading-relaxed">Measure creativity, logic, adaptability, and collaboration with adaptive tests.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Shield className="w-12 h-12 text-yellow-400 mr-6 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-400 text-xl mb-2">Blockchain Verification</h4>
                    <p className="text-gray-300 leading-relaxed">Secure, tamper-proof storage of your achievements and skills.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Users className="w-12 h-12 text-yellow-400 mr-6 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-400 text-xl mb-2">Global Accessibility</h4>
                    <p className="text-gray-300 leading-relaxed">Accessible to anyone, anywhere, breaking down barriers to opportunity.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-xl shadow-2xl"
            >
              <div className="text-center">
                <Globe className="w-24 h-24 mx-auto mb-6 text-yellow-400" />
                <h4 className="text-3xl font-bold text-white mb-6">A World Without Limits</h4>
                <p className="text-gray-300 leading-relaxed">
                  Your skills, your proof, your future.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 bg-black text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-12"
          >
            Meet the Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-16 max-w-4xl mx-auto leading-relaxed"
          >
            A diverse group of innovators passionate about transforming education and employment.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900 p-10 rounded-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
            >
              <Zap className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h3 className="text-2xl font-bold mb-4">Developers</h3>
              <p className="text-gray-300 leading-relaxed">Building the future of skill verification.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-900 p-10 rounded-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
            >
              <Target className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h3 className="text-2xl font-bold mb-4">Educators</h3>
              <p className="text-gray-300 leading-relaxed">Designing assessments that truly measure ability.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gray-900 p-10 rounded-xl shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
            >
              <Users className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h3 className="text-2xl font-bold mb-4">Visionaries</h3>
              <p className="text-gray-300 leading-relaxed">Driving the mission to democratize opportunity.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Join the Revolution
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-8"
          >
            Be part of the movement to prove real skills globally.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-black text-yellow-500 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started Today
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
