interface SkeletonProps {
  className?: string
}

// Squelette generique aux dimensions reelles du contenu qu'il remplace
// (DESIGN.md §6 : jamais de spinner plein ecran).
export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-card bg-sand-100 motion-reduce:animate-none dark:bg-night-700 ${className}`}
    />
  )
}
