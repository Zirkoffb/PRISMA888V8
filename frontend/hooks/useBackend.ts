import { useAuth } from './useAuth';
import { useSubdomain } from './useSubdomain';
import backend from '~backend/client';

export function useBackend() {
  const { getAuthToken } = useAuth();
  const { subdomain } = useSubdomain();
  
  const token = getAuthToken();
  if (!token) return backend;
  
  return backend.with({
    auth: () => ({
      authorization: `Bearer ${token}`,
      ...(subdomain && { 'x-subdomain': subdomain })
    })
  });
}
