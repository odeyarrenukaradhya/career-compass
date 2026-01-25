import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className={`${sizes[size]} gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
        <GraduationCap className="w-2/3 h-2/3 text-primary-foreground" />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold text-foreground`}>
          Place<span className="text-gradient">Pro</span>
        </span>
      )}
    </Link>
  );
};
