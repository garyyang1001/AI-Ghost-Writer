import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AuthProps {
  onLogin: (name: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg animate-fade-in-up max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">歡迎使用 Word Weaver AI</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          請輸入您的名字，開始個人化的寫作旅程。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="relative">
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            placeholder="您的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Name Input"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 transition-colors"
            disabled={!name.trim()}
          >
            開始編織內容
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;