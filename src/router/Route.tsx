import 'react';
import { useRouter } from './RouterContext';
import { ReactNode } from 'react';

interface RouteProps {
  path: string;
  children: ReactNode;
}

export function Route({ path, children }: RouteProps) {
  const { currentPath } = useRouter();
  
  // Handle exact matches and nested routes
  const isMatch = currentPath === path || 
    (path !== '/' && currentPath.startsWith(path));
  
  return isMatch ? <>{children}</> : null;
}

