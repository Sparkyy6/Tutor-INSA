import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { setupLoadingTimeout, clearAuthCookies } from './lib/cookieManager';

function App() {
  useEffect(() => {
    // Mettre en place le détecteur de chargement long
    const timeoutId = setupLoadingTimeout(8000);
    
    // Fonction pour détecter les problèmes de session au chargement
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Si l'utilisateur revient sur la page et elle est bloquée en chargement
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
          const loadingStart = loadingIndicator.getAttribute('data-loading-start');
          if (loadingStart && (Date.now() - parseInt(loadingStart)) > 5000) {
            console.warn('État de chargement prolongé détecté après retour sur la page');
            clearAuthCookies();
            window.location.href = '/?reload=' + Date.now();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Vérifier l'état juste après le montage du composant
    setTimeout(() => {
      const loadingIndicator = document.querySelector('.loading-indicator');
      if (loadingIndicator) {
        const loadingStart = loadingIndicator.getAttribute('data-loading-start');
        if (loadingStart && (Date.now() - parseInt(loadingStart)) > 3000) {
          console.log('Tentative de récupération précoce...');
          clearAuthCookies();
          window.location.reload();
        }
      }
    }, 3000);
    
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
}

export default App;