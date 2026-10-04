// Countries that have content in the database
export const COUNTRIES_WITH_DATA = [
  'Ethiopia',
  'Kenya', 
  'Rwanda',
  'Tanzania',
  'Vietnam'
];

export class CountryDataService {
  /**
   * Check if a country has content in the database
   */
  static hasData(countryName: string): boolean {
    return COUNTRIES_WITH_DATA.includes(countryName);
  }

  /**
   * Get all countries that have data
   */
  static getCountriesWithData(): string[] {
    return [...COUNTRIES_WITH_DATA];
  }

  /**
   * Get country data status for UI display
   */
  static getCountryStatus(countryName: string): {
    hasData: boolean;
    statusText: string;
    statusColor: string;
  } {
    const hasData = this.hasData(countryName);
    
    return {
      hasData,
      statusText: hasData ? 'Content available' : 'No content',
      statusColor: hasData ? 'text-green-400' : 'text-gray-500'
    };
  }

  /**
   * Get a visual indicator for countries with data
   */
  static getDataIndicator(countryName: string): string | null {
    return this.hasData(countryName) ? '●' : null;
  }

  /**
   * Get formatted country name with data indicator
   */
  static getFormattedCountryName(countryName: string): string {
    const indicator = this.getDataIndicator(countryName);
    return indicator ? `${indicator} ${countryName}` : countryName;
  }
}

