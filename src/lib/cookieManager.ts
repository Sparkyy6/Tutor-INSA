let cleanupPerformed = false;

export function clearAuthCookies() {
  if (cleanupPerformed) return true;
  
  try {
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=').map(c => c.trim());
      if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    cleanupPerformed = true;
    return true;
  } catch (error) {
    console.error('Failed to clear auth data:', error);
    return false;
  }
}

export function setupLoadingTimeout(timeout = 5000) {  
  return setTimeout(() => {
    if (document.readyState !== 'complete') {
      console.warn('Loading timeout - clearing auth data');
      clearAuthCookies();
      window.location.reload();
    }
  }, timeout);
}