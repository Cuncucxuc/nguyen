import React from 'react';
import { Check } from 'lucide-react';

interface BookingStepsProps {
  currentStep: number;
  steps?: string[];
}

const DEFAULT_STEPS = ['Chọn Suất', 'Chọn Ghế', 'Chọn Combo', 'Thanh Toán'];

export const BookingSteps: React.FC<BookingStepsProps> = ({
  currentStep,
  steps = DEFAULT_STEPS,
}) => {
  return (
    <div className="w-full py-6 px-4 bg-[#141414] border-b border-gray-800">
      <div className="max-w-4xl mx-auto">
        {/* Mobile View: Compact bar */}
        <div className="md:hidden flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs ring-2 ring-red-600/40">
              {currentStep + 1}
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Bước {currentStep + 1}/{steps.length}</span>
              <span className="text-sm font-semibold text-white">
                {steps[currentStep] || ''}
              </span>
            </div>
          </div>

          {/* Dots on mobile */}
          <div className="flex items-center space-x-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-6 bg-red-600'
                    : index < currentStep
                    ? 'w-2 bg-red-600/70'
                    : 'w-2 bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop View: Full horizontal stepper */}
        <div className="hidden md:flex items-center justify-between relative">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={index} className="flex-1 flex flex-col items-center relative group">
                {/* Connecting Line to next step */}
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-5 left-1/2 w-full h-[3px] -z-0 transition-colors duration-500"
                    style={{ left: '50%', right: '-50%' }}
                  >
                    <div
                      className={`h-full transition-all duration-500 ${
                        index < currentStep ? 'bg-red-600' : 'bg-gray-700'
                      }`}
                    />
                  </div>
                )}

                {/* Circle Icon/Number */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : isCurrent
                      ? 'bg-red-600 text-white ring-4 ring-red-600/30 shadow-lg shadow-red-600/40 scale-110'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white stroke-[2.5]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`mt-2.5 text-xs lg:text-sm font-medium transition-colors duration-200 tracking-wide ${
                    isCurrent
                      ? 'text-white font-semibold'
                      : isCompleted
                      ? 'text-gray-300'
                      : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookingSteps;
