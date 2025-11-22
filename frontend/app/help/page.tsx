'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, HelpCircle, Book, MessageCircle, ExternalLink } from 'lucide-react';

export default function HelpCenterPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const router = useRouter();

  const faqs = [
    {
      question: "How is LifeScore calculated?",
      answer: "LifeScore is calculated using a weighted formula: 50% Cognitive Assessment + 30% Portfolio Quality + 20% Endorsements. Each component is scored out of 1000 points, giving you a comprehensive view of your abilities."
    },
    {
      question: "What types of cognitive tests are available?",
      answer: "We offer 8 scientifically-validated cognitive categories: Logical Reasoning, Quantitative Aptitude, Pattern Recognition, Memory Tests, Reading Comprehension, Code Debugging, Learning Ability, and Communication Clarity."
    },
    {
      question: "How does portfolio analysis work?",
      answer: "Connect your GitHub profile and we'll analyze your repositories for code quality, consistency, complexity, and real-world impact. We look at commit frequency, language diversity, project stars, and contribution patterns."
    },
    {
      question: "What are endorsements and how do they work?",
      answer: "Endorsements are peer-verified skill attestations. Colleagues, mentors, or collaborators can endorse you for specific skills or traits. Each endorsement is weighted by the endorser's reputation and relationship strength."
    },
    {
      question: "How do I get my SBT certificate?",
      answer: "Once you achieve a LifeScore above 300, you can mint your Soulbound Token (SBT) certificate on blockchain. This provides permanent, verifiable proof of your abilities that cannot be transferred."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we use Firebase Authentication and secure API endpoints. Your personal data is encrypted, and you control what information is shared publicly. We never sell your data to third parties."
    },
    {
      question: "How often should I retake tests?",
      answer: "We recommend retaking cognitive tests every 3-6 months to track improvement. Portfolio analysis updates automatically when you push new code. Endorsements accumulate over time."
    },
    {
      question: "Can I delete my account?",
      answer: "Yes, you can delete your account in Settings. This will remove all your data permanently. Note that blockchain certificates cannot be deleted once minted."
    },
    {
      question: "How do referrals work?",
      answer: "Share your unique referral link. When someone signs up and completes onboarding, both you and your referral get bonus rewards including extra test attempts and score boosts."
    },
    {
      question: "What if I dispute my score?",
      answer: "You can request a score review in Settings. Our team will manually review your assessments and portfolio. Score adjustments are rare but possible for technical errors."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-gray-900 shadow-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Help Center
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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            How Can We Help You?
          </h2>
          <p className="text-xl text-gray-300">
            Find answers to common questions and learn how to make the most of LifeScore
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 text-center hover:border-yellow-400 transition">
            <Book className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Documentation</h3>
            <p className="text-gray-400 text-sm mb-4">Complete guides and tutorials</p>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">
              View Docs →
            </button>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 text-center hover:border-yellow-400 transition">
            <MessageCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Contact Support</h3>
            <p className="text-gray-400 text-sm mb-4">Get help from our team</p>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">
              Contact Us →
            </button>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 text-center hover:border-yellow-400 transition">
            <HelpCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Video Tutorials</h3>
            <p className="text-gray-400 text-sm mb-4">Step-by-step video guides</p>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">
              Watch Videos →
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-900 rounded-lg border border-yellow-500/20">
          <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
            <h3 className="text-xl font-bold">Frequently Asked Questions</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {faqs.map((faq, index) => (
              <div key={index} className="px-6 py-4">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition"
                >
                  <span className="font-semibold">{faq.question}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="mt-4 text-gray-300 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="mt-12 bg-gray-900 rounded-lg p-8 border border-yellow-500/20">
          <h3 className="text-2xl font-bold mb-6 text-center">Getting Started with LifeScore</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Step 1: Create Your Account</h4>
              <p className="text-gray-300 mb-4">Sign up with email or Google/GitHub OAuth. Complete the onboarding process to set your goals and skills.</p>

              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Step 2: Take Cognitive Tests</h4>
              <p className="text-gray-300 mb-4">Complete adaptive tests measuring your logical reasoning, problem-solving, and learning abilities.</p>

              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Step 3: Connect Your Portfolio</h4>
              <p className="text-gray-300 mb-4">Link your GitHub profile for automatic analysis of your coding projects and contributions.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Step 4: Get Endorsements</h4>
              <p className="text-gray-300 mb-4">Receive skill endorsements from colleagues, mentors, and peers in your network.</p>

              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Step 5: Earn Your Certificate</h4>
              <p className="text-gray-300 mb-4">Once you reach a qualifying score, mint your blockchain-verified SBT certificate.</p>

              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Step 6: Share Your Profile</h4>
              <p className="text-gray-300 mb-4">Share your verified ability profile with employers, clients, and the global talent community.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="mb-6">Our support team is here to help you succeed with LifeScore.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center space-x-2 bg-black text-yellow-400 px-6 py-3 rounded-lg hover:bg-gray-800 transition">
              <MessageCircle className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-black text-yellow-400 px-6 py-3 rounded-lg hover:bg-gray-800 transition">
              <ExternalLink className="w-4 h-4" />
              <span>API Documentation</span>
            </button>
          </div>
        </div>

        {/* Privacy & Terms */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-yellow-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-yellow-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-yellow-400 transition">Cookie Policy</a>
            <a href="#" className="hover:text-yellow-400 transition">Data Processing</a>
          </div>
        </div>
      </div>
    </div>
  );
}
