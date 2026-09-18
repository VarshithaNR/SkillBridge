export type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_STYLES: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2);
  return (initials || '?').toUpperCase();
}

/** SkillBridge reusable Avatar (Figma: Component Masters / Avatar). */
export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600 ${SIZE_STYLES[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
