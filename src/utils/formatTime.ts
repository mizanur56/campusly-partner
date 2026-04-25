export const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const notificationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffInMs = today.getTime() - notificationDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const formatTime = (d: Date) => {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${displayHours}:${displayMinutes}${ampm}`;
    };

    const formatDate = (d: Date) => {
      const day = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `${day} ${month}, ${year}`;
    };

    if (diffInDays === 0) {
      return `Today · ${formatTime(date)}`;
    } else if (diffInDays === 1) {
      return `Yesterday · ${formatTime(date)}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago · ${formatTime(date)}`;
    } else {
      return `${formatDate(date)} · ${formatTime(date)}`;
    }
  };