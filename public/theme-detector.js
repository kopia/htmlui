// Detect and apply theme immediately
(function() {
  try {
    // First try to load saved theme from localStorage
    const saved = localStorage.getItem('ui-theme');
    if (saved) {
      document.documentElement.classList.add(saved);
      return;
    }
    
    // If no saved theme, use system preference
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.add(isDark ? 'dark' : 'light');
  } catch (e) {
    document.documentElement.classList.add('light');
  }
})();
