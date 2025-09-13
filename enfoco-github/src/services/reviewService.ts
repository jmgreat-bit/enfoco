export class ReviewService {
  private static readonly REVIEW_DISMISSED_KEY = 'enfoco_review_dismissed';
  private static readonly REVIEW_COMPLETED_KEY = 'enfoco_review_completed';

  // Check if review was dismissed
  static isReviewDismissed(): boolean {
    const dismissed = localStorage.getItem(this.REVIEW_DISMISSED_KEY);
    if (!dismissed) return false;

    // If dismissed more than 7 days ago, allow showing again
    const dismissedTime = parseInt(dismissed);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return dismissedTime > sevenDaysAgo;
  }

  // Check if review was completed
  static isReviewCompleted(): boolean {
    const completed = localStorage.getItem(this.REVIEW_COMPLETED_KEY);
    if (!completed) return false;

    // If completed more than 30 days ago, allow showing again
    const completedTime = parseInt(completed);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return completedTime > thirtyDaysAgo;
  }

  // Mark review as dismissed
  static dismissReview(): void {
    localStorage.setItem(this.REVIEW_DISMISSED_KEY, Date.now().toString());
  }

  // Mark review as completed
  static completeReview(): void {
    localStorage.setItem(this.REVIEW_COMPLETED_KEY, Date.now().toString());
  }

  // Open review link
  static openReviewLink(): void {
    // Open the website in a new tab where users can leave reviews
    window.open('https://e-eenfocco.vercel.app/', '_blank');
  }

  // Check if we should show review on logout
  static shouldShowReviewOnLogout(): boolean {
    return !this.isReviewDismissed() && !this.isReviewCompleted();
  }
}
