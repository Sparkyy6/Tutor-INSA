/**
 * Utilitaire pour gérer les cookies et les problèmes liés
 */

// Fonction pour nettoyer les cookies de session si nécessaire
export function clearAuthCookies() {
  try {
    // Supprimer les cookies liés à Supabase/Auth
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=').map(c => c.trim());
      if (name.includes('sb-') || name.includes('supabase') || name.includes('auth')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    // Nettoyer aussi le localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('tutor-insa-auth'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage des cookies:', error);
    return false;
  }
}

// Fonction pour vérifier si le chargement est trop long
export function setupLoadingTimeout(timeout = 10000) {  
  return setTimeout(() => {
    // Si la page est bloquée plus de 10 secondes sur le chargement
    if (document.readyState !== 'complete') {
      console.warn('Chargement anormalement long, nettoyage des cookies...');
      clearAuthCookies();
      window.location.reload();
    }
  }, timeout);
}