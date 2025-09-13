import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  activeSection, 
  onSectionChange 
}) => {
  const { state } = useAuth();
  const { user } = state;

  const navigationItems = [
    { 
      id: 'articles', 
      label: 'Articles', 
      icon: (
        <svg className={`${isCollapsed ? 'w-10 h-10' : 'w-6 h-6'} ${activeSection === 'articles' ? 'text-black' : 'text-blue-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      )
    },
    { 
      id: 'videos', 
      label: 'Videos', 
      icon: (
        <svg className={`${isCollapsed ? 'w-10 h-10' : 'w-6 h-6'} ${activeSection === 'videos' ? 'text-black' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
        </svg>
      )
    },
    { 
      id: 'books', 
      label: 'Books', 
      icon: (
        <svg className={`${isCollapsed ? 'w-10 h-10' : 'w-6 h-6'} ${activeSection === 'books' ? 'text-black' : 'text-green-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19M17,12H7V10H17V12M15,16H7V14H15V16M17,8H7V6H17V8Z"/>
        </svg>
      )
    },
    { 
      id: 'audio', 
      label: 'Audio', 
      icon: (
        <svg className={`${isCollapsed ? 'w-10 h-10' : 'w-6 h-6'} ${activeSection === 'audio' ? 'text-black' : 'text-purple-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13A4,4 0 0,0 6,17A4,4 0 0,0 10,21A4,4 0 0,0 14,17V7H18V3H12Z"/>
        </svg>
      )
    },
    { 
      id: 'saved', 
      label: 'Saved', 
      icon: (
        <svg className={`${isCollapsed ? 'w-10 h-10' : 'w-6 h-6'} ${activeSection === 'saved' ? 'text-black' : 'text-yellow-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>
        </svg>
      )
    },
  ];

  return (
    <div className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-white">ENFOCO</h2>
            </div>
          )}
          <button
            onClick={onToggle}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-4' : 'space-x-3 px-3 py-2'} rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  );
};