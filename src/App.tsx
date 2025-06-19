import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { setupLoadingTimeout, clearAuthCookies } from './lib/cookieManager';
import { supabase } from './lib/supabase';

const App = () => {
  useEffect(() => {
    const timeoutId = setupLoadingTimeout(10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator?.getAttribute('data-loading-start')) {
          const loadingTime = Date.now() - parseInt(loadingIndicator.getAttribute('data-loading-start')!);
          if (loadingTime > 10000) {
            clearAuthCookies();
            window.location.reload();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;