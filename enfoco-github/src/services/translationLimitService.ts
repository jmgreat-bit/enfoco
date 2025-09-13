interface TranslationData {
  usedCount: number;
  lastUsed: number;
  cooldownStart: number | null;
}

export class TranslationLimitService {
  private static readonly MAX_TRANSLATIONS = 15;
  private static readonly COOLDOWN_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  private static readonly STORAGE_KEY = 'enfoco_ai_translator_data';

  /**
   * Check if user can perform a translation
   */
  static canTranslate(): { canTranslate: boolean; remainingCount: number; cooldownTime?: number } {
    const data = this.getTranslationData();
    
    // Check if we're in cooldown period
    if (data.cooldownStart) {
      const timeSinceCooldown = Date.now() - data.cooldownStart;
      if (timeSinceCooldown < this.COOLDOWN_DURATION) {
        const remainingCooldown = this.COOLDOWN_DURATION - timeSinceCooldown;
        return {
          canTranslate: false,
          remainingCount: 0,
          cooldownTime: remainingCooldown
        };
      } else {
        // Cooldown period is over, reset the data
        this.resetTranslationData();
        return {
          canTranslate: true,
          remainingCount: this.MAX_TRANSLATIONS
        };
      }
    }

    // Check if we've used all translations
    if (data.usedCount >= this.MAX_TRANSLATIONS) {
      // Start cooldown period
      this.startCooldown();
      return {
        canTranslate: false,
        remainingCount: 0,
        cooldownTime: this.COOLDOWN_DURATION
      };
    }

    return {
      canTranslate: true,
      remainingCount: this.MAX_TRANSLATIONS - data.usedCount
    };
  }

  /**
   * Record a translation usage
   */
  static recordTranslation(): { success: boolean; remainingCount: number; cooldownTime?: number } {
    const canTranslateResult = this.canTranslate();
    
    if (!canTranslateResult.canTranslate) {
      return {
        success: false,
        remainingCount: canTranslateResult.remainingCount,
        cooldownTime: canTranslateResult.cooldownTime
      };
    }

    const data = this.getTranslationData();
    data.usedCount += 1;
    data.lastUsed = Date.now();
    
    this.saveTranslationData(data);

    // Check if we've reached the limit
    if (data.usedCount >= this.MAX_TRANSLATIONS) {
      this.startCooldown();
      return {
        success: true,
        remainingCount: 0,
        cooldownTime: this.COOLDOWN_DURATION
      };
    }

    return {
      success: true,
      remainingCount: this.MAX_TRANSLATIONS - data.usedCount
    };
  }

  /**
   * Get remaining translations count
   */
  static getRemainingCount(): number {
    const result = this.canTranslate();
    return result.remainingCount;
  }

  /**
   * Get cooldown time remaining in milliseconds
   */
  static getCooldownTime(): number | null {
    const data = this.getTranslationData();
    
    if (!data.cooldownStart) {
      return null;
    }

    const timeSinceCooldown = Date.now() - data.cooldownStart;
    if (timeSinceCooldown >= this.COOLDOWN_DURATION) {
      // Cooldown is over, reset data
      this.resetTranslationData();
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
   * Get translation status for UI display
   */
  static getTranslationStatus(): {
    canTranslate: boolean;
    remainingCount: number;
    cooldownTime?: string;
    statusMessage: string;
  } {
    const result = this.canTranslate();
    
    if (!result.canTranslate && result.cooldownTime) {
      return {
        canTranslate: false,
        remainingCount: 0,
        cooldownTime: this.formatCooldownTime(result.cooldownTime),
        statusMessage: `AI Translation limit reached. Next batch available in ${this.formatCooldownTime(result.cooldownTime)}`
      };
    }

    if (result.remainingCount === 0) {
      return {
        canTranslate: false,
        remainingCount: 0,
        statusMessage: 'AI Translation limit reached'
      };
    }

    return {
      canTranslate: true,
      remainingCount: result.remainingCount,
      statusMessage: 'AI Translation Available'
    };
  }

  /**
   * Reset translation data (for testing or manual reset)
   */
  static resetTranslationData(): void {
    const resetData: TranslationData = {
      usedCount: 0,
      lastUsed: 0,
      cooldownStart: null
    };
    this.saveTranslationData(resetData);
  }

  /**
   * Get translation data from localStorage
   */
  private static getTranslationData(): TranslationData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading translation data from localStorage:', error);
    }

    // Return default data
    return {
      usedCount: 0,
      lastUsed: 0,
      cooldownStart: null
    };
  }

  /**
   * Save translation data to localStorage
   */
  private static saveTranslationData(data: TranslationData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving translation data to localStorage:', error);
    }
  }

  /**
   * Start cooldown period
   */
  private static startCooldown(): void {
    const data = this.getTranslationData();
    data.cooldownStart = Date.now();
    this.saveTranslationData(data);
  }
}

