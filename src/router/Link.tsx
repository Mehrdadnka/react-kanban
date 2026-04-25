import { ReactNode } from 'react';
import { useRouter } from './RouterContext';

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export function Link({ to, children, className = '', activeClassName = '' }: LinkProps) {
  const { navigate, currentPath } = useRouter();
  
  const isActive = currentPath === to;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };
  
  return (
    <a
      href={to}
      onClick={handleClick}
      className={`${className} ${isActive ? activeClassName : ''}`}
    >
      {children}
    </a>
  );
}