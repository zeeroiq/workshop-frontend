import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Technician Avatar Component
 * Displays technician initials in a colored circle
 * Click to open technician profile (optional)
 *
 * @component
 * @param {string} name - Technician full name
 * @param {string} avatarColor - Hex color for avatar background
 * @param {string} avatarBg - Tailwind bg color class (optional override)
 * @param {string} initials - Custom initials (defaults to first letter of first/last name)
 * @param {function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 * @param {string} size - Avatar size ('sm' | 'md' | 'lg')
 * @param {boolean} clickable - Show cursor pointer on hover
 * @returns {React.ReactElement}
 */
export const TechnicianAvatar = ({
  name = 'User',
  avatarColor = '#A3A3A3',
  avatarBg = null,
  initials = null,
  onClick = null,
  className = '',
  size = 'md',
  clickable = false,
  role = null,
  isAvailable = true,
  title = null,
}) => {
  // Generate initials if not provided
  const getInitials = () => {
    if (initials) return initials;

    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() || 'U';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const baseClasses = cn(
    'flex items-center justify-center rounded-full font-bold text-white',
    'flex-shrink-0',
    'relative',
    sizeClasses[size],
    onClick && 'cursor-pointer',
    className
  );

  return (
    <div
      className={baseClasses}
      style={{
        backgroundColor: avatarColor,
        opacity: isAvailable ? 1 : 0.6,
      }}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
      title={title || `${name}${role ? ` - ${role}` : ''}`}
      aria-label={`${name}${role ? ` - ${role}` : ''}`}
    >
      {getInitials()}

      {/* Status indicator dot */}
      <div
        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white"
        style={{
          backgroundColor: isAvailable ? '#22c55e' : '#ef4444',
        }}
        title={isAvailable ? 'Available' : 'Unavailable'}
      />
    </div>
  );
};

/**
 * Inline Avatar with direct styling
 */
export const TechnicianAvatarInline = ({
  name = 'User',
  avatarColor = '#A3A3A3',
  initials = null,
  onClick = null,
  size = 'md',
  isAvailable = true,
}) => {
  const getInitials = () => {
    if (initials) return initials;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() || 'U';
  };

  const sizeStyles = {
    sm: { width: '32px', height: '32px', fontSize: '0.75rem' },
    md: { width: '40px', height: '40px', fontSize: '0.875rem' },
    lg: { width: '48px', height: '48px', fontSize: '1rem' },
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        fontWeight: 700,
        color: 'white',
        backgroundColor: avatarColor,
        opacity: isAvailable ? 1 : 0.6,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        flexShrink: 0,
        ...sizeStyles[size],
      }}
      onClick={onClick}
      title={name}
    >
      {getInitials()}

      {/* Status dot */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid white',
          backgroundColor: isAvailable ? '#22c55e' : '#ef4444',
        }}
      />
    </div>
  );
};

/**
 * Avatar Group (multiple technicians)
 */
export const TechnicianAvatarGroup = ({
  technicians = [],
  maxDisplay = 3,
  size = 'md',
  onClick = null,
}) => {
  const displayed = technicians.slice(0, maxDisplay);
  const remaining = Math.max(0, technicians.length - maxDisplay);

  return (
    <div className="flex -space-x-2">
      {displayed.map((tech) => (
        <div
          key={tech.id}
          className="border-2 border-white rounded-full"
          onClick={() => onClick?.(tech)}
        >
          <TechnicianAvatar
            name={tech.name}
            avatarColor={tech.avatarColor}
            size={size}
            isAvailable={tech.isAvailable}
          />
        </div>
      ))}

      {remaining > 0 && (
        <div
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-gray-700 border-2 border-white"
          title={`+${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default TechnicianAvatar;
