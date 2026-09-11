import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/Buttons/Button';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-3xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mb-6">
        <Brain className="w-16 h-16 animate-pulse" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        404 - Asset Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        The requested enterprise intelligence page or resource does not exist in the platform index.
      </p>

      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={() => navigate(-1)} icon={ArrowLeft}>
          Go Back
        </Button>
        <Button variant="primary" onClick={() => navigate('/employee/dashboard')} icon={Home}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
