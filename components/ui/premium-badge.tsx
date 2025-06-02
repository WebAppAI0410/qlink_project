import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'subtle';
  className?: string;
}

export function PremiumBadge({ 
  size = 'md', 
  variant = 'default',
  className = '' 
}: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md',
    outline: 'border-2 border-yellow-400 text-yellow-600 bg-yellow-50',
    subtle: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  return (
    <Badge 
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        rounded-full font-medium flex items-center gap-1 
        ${className}
      `}
    >
      <Crown size={iconSizes[size]} />
      プレミアム
    </Badge>
  );
} 