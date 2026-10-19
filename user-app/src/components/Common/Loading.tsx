import React from 'react';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Đang tải...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f0f0f] text-white">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing spinning ring */}
        <div className="w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
        {/* Inner pulsing cinema dot */}
        <div className="absolute w-6 h-6 rounded-full bg-red-600/30 animate-pulse" />
      </div>
      <p className="mt-4 text-gray-400 font-medium text-sm tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loading;
