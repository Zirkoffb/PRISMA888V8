import { useMemo } from 'react';

export function useSubdomain() {
  const subdomain = useMemo(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // If we have more than 2 parts and it's not localhost, first part is subdomain
    if (parts.length > 2 && parts[0] !== 'localhost') {
      return parts[0];
    }
    
    // For development, check for subdomain in URL params
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('subdomain');
  }, []);

  const isAdmin = subdomain === 'admin' || subdomain === null;

  return { subdomain, isAdmin };
}
