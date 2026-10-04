import React from 'react';

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

  const navigationItems = [
    { 
      id: 'articles', 
      label: 'Live Intelligence', 
      icon: (
        <svg className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${activeSection === 'articles' ? 'text-black' : 'text-cyan-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      )
    },
    { 
      id: 'global', 
      label: 'Global Diplomacy', 
      icon: (
        <svg className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${activeSection === 'global' ? 'text-black' : 'text-blue-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 19.93,11H15.93C15.82,8.68 15.17,6.56 14.1,4.84C14.77,4.32 15.53,4 12,4M12,20C15.53,20 14.77,19.68 14.1,19.16C15.17,17.44 15.82,15.32 15.93,13H19.93A8,8 0 0,1 12,20Z"/>
        </svg>
      )
    },
    { 
      id: 'saved', 
      label: 'Saved Briefings', 
      icon: (
        <svg className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${activeSection === 'saved' ? 'text-black' : 'text-amber-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>
        </svg>
      )
    },
    { 
      id: 'stats', 
      label: 'Telemetry & Health', 
      icon: (
        <svg className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${activeSection === 'stats' ? 'text-black' : 'text-emerald-400'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
        </svg>
      )
    },
  ];

  return (
    <div className={`bg-gray-950 border-r border-gray-800 flex flex-col justify-between transition-all duration-300 min-h-screen ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div>
        {/* Header */}
        <div className="p-4 border-b border-gray-800/80">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <h2 className="text-xl font-black tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                  ENFOCO
                </h2>
              </div>
            )}
            <button
              onClick={onToggle}
              className="w-8 h-8 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
        <nav className="p-3">
          <ul className="space-y-1.5">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3 py-2.5'} rounded-lg transition-all duration-150 ${
                    activeSection === item.id
                      ? 'bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Footer Info Box */}
      {!isCollapsed && (
        <div className="p-4 m-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Pipeline: OK</span>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Google Gemini 2.5 Flash active. Syncs across 49 countries every 4 hours.
          </p>
        </div>
      )}
    </div>
  );
};