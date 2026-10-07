import React, { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  error 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer flex justify-between items-center`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? '' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                option.isTitle 
                  ? 'font-semibold bg-gray-50 text-gray-600 cursor-default hover:bg-gray-50' 
                  : ''
              }`}
              onClick={() => {
                if (!option.isTitle) {
                  onChange(option.value);
                  // Only close if it's a room selection (not a floor and not back button)
                  if (!option.isFloor && !option.isBack) {
                    setIsOpen(false);
                  }
                }
              }}
            >
              {option.isTitle ? (
                <div className="text-sm uppercase tracking-wider">{option.label}</div>
              ) : option.isBack ? (
                <div className="text-blue-600 font-medium hover:text-blue-700 border-b border-gray-200 pb-2 mb-1">
                  {option.label}
                </div>
              ) : (
                <div className={`${option.isFloor ? 'text-green-600 font-medium' : ''}`}>
                  {option.label}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}