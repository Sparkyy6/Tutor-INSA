export const clearAuthCookies = () => {
  try {
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=').map(c => c.trim());
      if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });

    // Clear storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase') || key.includes('tutor-insa-auth')) {
        localStorage.removeItem(key);
      }
    });

    // Clear session storage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

export const setupLoadingTimeout = (timeout = 10000) => {
  return setTimeout(() => {
    if (document.readyState !== 'complete') {
      console.warn('Loading timeout - clearing auth data');
      clearAuthCookies();
      window.location.reload();
    }
  }, timeout);
};