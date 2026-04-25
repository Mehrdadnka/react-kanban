import React from 'react';
import { useRouter } from './RouterContext';

interface RoutesProps {
  children: React.ReactNode | React.ReactNode[];
}

interface RouteChild {
  props?: {
    path?: string;
    children?: React.ReactNode;
  };
}

export function Routes({ children }: RoutesProps) {
  const { currentPath } = useRouter();
  
  const childrenArray = React.Children.toArray(children);
  
  let matchingRoute: React.ReactNode = null;
  
  for (const child of childrenArray) {
    if (React.isValidElement(child)) {
      const { path } = child.props as { path?: string };
      
      if (path) {
        if (currentPath === path) {
          matchingRoute = child;
          break;
        }
        
        if (path !== '/' && currentPath.startsWith(path + '/')) {
          matchingRoute = child;
          break;
        }
      }
    }
  }
  
  if (!matchingRoute) {
    return <div>404 - Page Not Found</div>;
  }
  
  return <>{matchingRoute}</>;
}