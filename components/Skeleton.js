export default function Skeleton({ variant = 'text', className = '' }) {
  const baseClasses = 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:1000px_100%] rounded-xl';

  const variants = {
    banner: 'h-[300px] md:h-[450px] w-full rounded-none',
    title: 'h-8 w-3/4 mb-4',
    text: 'h-4 w-full mb-2',
    sidebar: 'h-64 w-full',
    card: 'h-80 w-full',
    avatar: 'h-12 w-12 rounded-full',
    avatarLarge: 'h-24 w-24 rounded-full',
    button: 'h-10 w-32',
    profileHeader: 'h-32 w-full',
    tourCard: 'h-[400px] w-full',
    galleryItem: 'aspect-[4/3] w-full',
    reviewItem: 'h-32 w-full',
    statCard: 'h-32 w-full',
  };

  return (
    <div className={`${baseClasses} ${variants[variant] || variants.text} ${className}`} />
  );
}
