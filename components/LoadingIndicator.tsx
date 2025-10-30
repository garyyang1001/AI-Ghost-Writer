import React, { useState, useEffect } from 'react';

interface LoadingIndicatorProps {
  title: string;
  messages: string[];
  icon: React.ReactNode;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ title, messages, icon }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center animate-fade-in">
      <div className="flex justify-center items-center mb-6">
        <div className="animate-spin mr-4">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="h-6 mt-4 text-gray-600 dark:text-gray-300 transition-opacity duration-500">
        <p key={currentMessageIndex} className="animate-fade-in-out">
            {messages[currentMessageIndex]}
        </p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
