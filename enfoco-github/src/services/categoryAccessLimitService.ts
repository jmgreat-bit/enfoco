interface CategoryAccessData {
  usedCount: number;
  lastUsed: number;
  cooldownStart: number | null;
}

export class CategoryAccessLimitService {
  private static readonly MAX_CATEGORY_ACCESS = 10; // 10 category visits per window
  private static readonly COOLDOWN_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  private static readonly STORAGE_KEY = 'enfoco_category_access_data';

  /**
   * Check if user can access a category page
   */
  static canAccessCategory(): { canAccess: boolean; remainingCount: number; cooldownTime?: number } {
    const data = this.getCategoryAccessData();
    
    // Check if we're in cooldown period
    if (data.cooldownStart) {
      const timeSinceCooldown = Date.now() - data.cooldownStart;
      if (timeSinceCooldown < this.COOLDOWN_DURATION) {
        const remainingCooldown = this.COOLDOWN_DURATION - timeSinceCooldown;
        return {
          canAccess: false,
          remainingCount: 0,
          cooldownTime: remainingCooldown
        };
      } else {
        // Cooldown period is over, reset the data
        this.resetCategoryAccessData();
        return {
          canAccess: true,
          remainingCount: this.MAX_CATEGORY_ACCESS
        };
      }
    }

    // Check if we've used all category accesses
    if (data.usedCount >= this.MAX_CATEGORY_ACCESS) {
      // Start cooldown period
      this.startCooldown();
      return {
        canAccess: false,
        remainingCount: 0,
        cooldownTime: this.COOLDOWN_DURATION
      };
    }

    return {
      canAccess: true,
      remainingCount: this.MAX_CATEGORY_ACCESS - data.usedCount
    };
  }

  /**
   * Record a category access
   */
  static recordCategoryAccess(): { success: boolean; remainingCount: number; cooldownTime?: number } {
    const canAccessResult = this.canAccessCategory();
    
    if (!canAccessResult.canAccess) {
      return {
        success: false,
        remainingCount: canAccessResult.remainingCount,
        cooldownTime: canAccessResult.cooldownTime
      };
    }

    const data = this.getCategoryAccessData();
    data.usedCount += 1;
    data.lastUsed = Date.now();
    
    this.saveCategoryAccessData(data);

    // Check if we've reached the limit
    if (data.usedCount >= this.MAX_CATEGORY_ACCESS) {
      this.startCooldown();
      return {
        success: true,
        remainingCount: 0,
        cooldownTime: this.COOLDOWN_DURATION
      };
    }

    return {
      success: true,
      remainingCount: this.MAX_CATEGORY_ACCESS - data.usedCount
    };
  }

  /**
   * Get remaining category access count
   */
  static getRemainingCount(): number {
    const result = this.canAccessCategory();
    return result.remainingCount;
  }

  /**
   * Get cooldown time remaining in milliseconds
   */
  static getCooldownTime(): number | null {
    const data = this.getCategoryAccessData();
    
    if (!data.cooldownStart) {
      return null;
    }

    const timeSinceCooldown = Date.now() - data.cooldownStart;
    if (timeSinceCooldown >= this.COOLDOWN_DURATION) {
      // Cooldown is over, reset data
      this.resetCategoryAccessData();
      return null;
    }

    return this.COOLDOWN_DURATION - timeSinceCooldown;
  }

  /**
   * Format cooldown time for display
   */
  static formatCooldownTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get category access status for UI display
   */
  static getCategoryAccessStatus(): {
    canAccess: boolean;
    remainingCount: number;
    cooldownTime?: string;
    statusMessage: string;
  } {
    const result = this.canAccessCategory();
    
    if (!result.canAccess && result.cooldownTime) {
      return {
        canAccess: false,
        remainingCount: 0,
        cooldownTime: this.formatCooldownTime(result.cooldownTime),
        statusMessage: `Category limit reached. Next batch available in ${this.formatCooldownTime(result.cooldownTime)}`
      };
    }

    if (result.remainingCount === 0) {
      return {
        canAccess: false,
        remainingCount: 0,
        statusMessage: 'Category limit reached'
      };
    }

    return {
      canAccess: true,
      remainingCount: result.remainingCount,
      statusMessage: 'Category Browsing Available'
    };
  }

  /**
   * Reset category access data (for testing or manual reset)
   */
  static resetCategoryAccessData(): void {
    const resetData: CategoryAccessData = {
      usedCount: 0,
      lastUsed: 0,
      cooldownStart: null
    };
    this.saveCategoryAccessData(resetData);
  }

  /**
   * Get category access data from localStorage
   */
  private static getCategoryAccessData(): CategoryAccessData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading category access data from localStorage:', error);
    }

    // Return default data
    return {
      usedCount: 0,
      lastUsed: 0,
      cooldownStart: null
    };
  }

  /**
   * Save category access data to localStorage
   */
  private static saveCategoryAccessData(data: CategoryAccessData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving category access data to localStorage:', error);
    }
  }

  /**
   * Start cooldown period
   */
  private static startCooldown(): void {
    const data = this.getCategoryAccessData();
    data.cooldownStart = Date.now();
    this.saveCategoryAccessData(data);
  }
}
