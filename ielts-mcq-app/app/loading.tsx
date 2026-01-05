/**
 * Loading Component
 * Displayed during page transitions and data loading
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        
        {/* Loading text */}
        <p className="text-muted-foreground text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
