import React, { useState, useEffect, useRef } from 'react';

interface AutoScrollCategoryBarProps {
  categories: string[];
  onCategoryClick: (category: string) => void;
  categoryAccessStatus: {
    canAccess: boolean;
    remainingCount: number;
    statusMessage: string;
  };
}

export const AutoScrollCategoryBar: React.FC<AutoScrollCategoryBarProps> = ({ 
  categories, 
  onCategoryClick,
  categoryAccessStatus
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.3; // Slower speed for smoother animation
    const scrollDirection = 1; // 1 for right, -1 for left
    let animationId: number;
    let isPaused = false;

    const scroll = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed * scrollDirection;
        container.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(scroll);
    };

    // Start auto-scroll
    animationId = requestAnimationFrame(scroll);

    // Pause on hover
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onCategoryClick(category);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-3 overflow-x-hidden scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Create many copies to make it seem infinitely long */}
            {Array.from({ length: 20 }, (_, setIndex) => 
              categories.map((category) => (
                <button
                  key={`set-${setIndex}-${category}`}
                  onClick={() => handleCategoryClick(category)}
                  disabled={!categoryAccessStatus.canAccess}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-cyan-500 text-white'
                      : categoryAccessStatus.canAccess
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  title={categoryAccessStatus.canAccess 
                    ? `Browse ${category}` 
                    : 'Category limit reached'
                  }
                >
                  {category}
                </button>
              ))
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
