import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export const SkillAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const questions = [
    {
      id: 1,
      skill: 'Generative AI & RAG Architecture',
      question: 'Which vector indexing algorithm provides optimal trade-off between build time and query latency for large embedding datasets?',
      options: ['Flat L2 Index', 'HNSW (Hierarchical Navigable Small World)', 'Inverted File Index (IVF)', 'Scalar Quantization (SQ8)'],
    },
    {
      id: 2,
      skill: 'Kubernetes Microservices Security',
      question: 'In a Zero-Trust Kubernetes cluster, what is the primary mechanism to enforce strict pod-to-pod communication controls?',
      options: ['ClusterRoleBindings', 'Kubernetes NetworkPolicies / Istio AuthorizationPolicy', 'Pod Security Admission (PSA)', 'NodePort Services'],
    },
    {
      id: 3,
      skill: 'React 19 Architecture',
      question: 'What is the primary benefit of React 19 Server Components over traditional client-side data fetching?',
      options: ['Eliminates layout shifts completely', 'Renders component logic directly on the server without sending JS bundle code to client', 'Replaces Redux state management', 'Enforces strict CSS scoping'],
    },
  ];

  const handleSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/employee/assessment-results');
    }
  };

  const activeQ = questions[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Q3 Senior Engineer Skill Benchmark Assessment
          </h1>
          <p className="text-xs text-slate-500">
            Question {currentStep + 1} of {questions.length} • Category: {activeQ.skill}
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>14:20 Left</span>
        </div>
      </div>

      <ProgressBar progress={progressPercent} showPercentage={true} color="bg-blue-600" />

      {/* Question Card */}
      <Card className="space-y-6">
        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
            {activeQ.skill}
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white pt-1">
            {activeQ.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {activeQ.options.map((opt, idx) => {
            const isSelected = answers[activeQ.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(activeQ.id, idx)}
                className={`w-full p-4 text-left rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{opt}</span>
                {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleNext}
            disabled={answers[activeQ.id] === undefined}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition"
          >
            <span>{currentStep === questions.length - 1 ? 'Submit & View Gap Analysis' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};
