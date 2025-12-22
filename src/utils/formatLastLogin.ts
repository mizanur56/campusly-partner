function formatLastLogin(lastLogin: string | Date): string {
  // Ensure lastLogin is a Date object
  const loginDate = lastLogin instanceof Date ? lastLogin : new Date(lastLogin);

  const now = new Date();
  const diffMs = now.getTime() - loginDate.getTime(); // difference in milliseconds

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30); // Approximate month
  const diffYears = Math.floor(diffDays / 365); // Approximate year

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  } else {
    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
  }
}

export default formatLastLogin;
