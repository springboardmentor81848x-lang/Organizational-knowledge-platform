import React from 'react';
import { Clock, BookOpen } from 'lucide-react';

const mockPath = [
  {
    phase: 1,
    title: 'Foundational Skill Acquisition',
    duration: '10 Weeks',
    reason: 'Establish core proficiency in cloud and DevOps.',
  },
  {
    phase: 2,
    title: 'Advanced Java Development',
    duration: '12 Weeks',
    reason: 'Bridge the experience gap in microservices.',
  },
  {
    phase: 3,
    title: 'Architecture & Design Patterns',
    duration: '8 Weeks',
    reason: 'Master system design and scalability.',
  },
];

const EmployeeLearningPath: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BookOpen className="h-8 w-8 text-purple-600" />
        My Learning Path
      </h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="relative pl-6 border-l-2 border-purple-200 space-y-8">
          {mockPath.map((phase) => (
            <div key={phase.phase} className="relative">
              <div className="absolute -left-3 top-1 w-5 h-5 bg-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                {phase.phase}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">{phase.title}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {phase.duration}
                </p>
                <p className="text-sm text-gray-600 mt-1">{phase.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400 border-t border-gray-200 pt-4">
        Based on your skill gaps and job role requirements.
      </div>
    </div>
  );
};

export default EmployeeLearningPath;