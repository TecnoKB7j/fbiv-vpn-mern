import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkTheme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
      {isDarkTheme ? '☀️' : '🌙'}
    </div>
  );
};

export default ThemeToggle;