'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function CognitiveTestPage() {
  const [token, setToken] = useState('');
  const [testId, setTestId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [startTime, setStartTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<any>(null);
  const router = useRouter();

  const questions = [
    { id: '1', text: 'What is 15 + 28?', options: ['41', '42', '43', '44'], correct: '43', difficulty: 1 },
    { id: '2', text: 'Which word does not belong: Car, Train, Bicycle, Book?', options: ['Car', 'Train', 'Bicycle', 'Book'], correct: 'Book', difficulty: 1.2 },
    { id: '3', text: 'If all roses are flowers and some flowers are red, are all roses red?', options: ['Yes', 'No', 'Maybe'], correct: 'No', difficulty: 1.5 },
    { id: '4', text: 'What comes next: 2, 4, 8, 16, ?', options: ['20', '24', '32', '64'], correct: '32', difficulty: 1.3 },
    { id: '5', text: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], correct: '6', difficulty: 1 },
  ];

  useEffect(() => {
    const initTest = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const idToken = await user.getIdToken();
      setToken(idToken);

      try {
        const test = await apiRequest('/cognitive/start', {
          method: 'POST',
          body: JSON.stringify({ test_type: 'general' }),
        }, idToken);
        setTestId(test.test_id);
        setStartTime(Date.now());
      } catch (err) {
        console.error('Error starting test:', err);
      }
    };

    initTest();
  }, [router]);

  const handleAnswer = (answer: string) => {
    const question = questions[currentQuestion];
    setAnswers({
      ...answers,
      [question.id]: {
        answer,
        correct: answer === question.correct,
        difficulty: question.difficulty,
      },
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await apiRequest('/cognitive/submit', {
        method: 'POST',
        body: JSON.stringify({
          test_id: testId,
          answers: answers,
          time_taken_seconds: timeTaken,
        }),
      }, token);

      setScore(result);
      setCompleted(true);
    } catch (err: any) {
      alert('Error submitting test: ' + err.message);
    }
  };

  if (completed && score) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Test Complete!</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Accuracy Score</p>
              <p className="text-2xl font-bold text-blue-600">{score.accuracy_score.toFixed(1)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Speed Score</p>
              <p className="text-2xl font-bold text-green-600">{score.speed_score.toFixed(1)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Difficulty Score</p>
              <p className="text-2xl font-bold text-purple-600">{score.difficulty_score.toFixed(1)}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Composite Score</p>
              <p className="text-2xl font-bold text-indigo-600">{score.composite_score.toFixed(1)}</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers[question.id]?.answer;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600">
                Time: {Math.floor((Date.now() - startTime) / 1000)}s
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.text}</h2>

          <div className="space-y-3 mb-6">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition ${
                  selectedAnswer === option
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-gray-900">{option}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Submit Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
