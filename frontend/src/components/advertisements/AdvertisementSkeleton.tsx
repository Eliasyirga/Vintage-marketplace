interface AdvertisementSkeletonProps {
  placement?: 'HOME_TOP' | 'MARKETPLACE_MIDDLE' | 'MARKETPLACE_BOTTOM'
  className?: string
}

export function AdvertisementSkeleton({ placement = 'HOME_TOP', className = '' }: AdvertisementSkeletonProps) {
  if (placement === 'MARKETPLACE_MIDDLE') {
    return (
      <div
        className={`rounded-3xl bg-white border border-stone-200 p-5 shadow-sm animate-pulse flex flex-col justify-between ${className}`}
      >
        <div className="space-y-3">
          <div className="w-full aspect-[16/9] bg-stone-100 rounded-2xl" />
          <div className="h-3 w-20 bg-stone-200 rounded-full" />
          <div className="h-4 w-3/4 bg-stone-200 rounded-lg" />
          <div className="h-3 w-full bg-stone-100 rounded-md" />
        </div>
        <div className="h-9 w-full bg-stone-200 rounded-xl mt-4" />
      </div>
    )
  }

  return (
    <div
      className={`w-full rounded-3xl bg-white border border-stone-200 p-4 sm:p-6 shadow-sm animate-pulse flex flex-col md:flex-row items-center gap-5 ${className}`}
    >
      <div className="w-full md:w-56 h-32 bg-stone-100 rounded-2xl shrink-0" />
      <div className="flex-1 w-full space-y-2.5">
        <div className="h-3 w-24 bg-stone-200 rounded-full" />
        <div className="h-5 w-2/3 bg-stone-200 rounded-lg" />
        <div className="h-3.5 w-full bg-stone-100 rounded-md" />
        <div className="h-3.5 w-4/5 bg-stone-100 rounded-md" />
      </div>
      <div className="w-full md:w-36 h-10 bg-stone-200 rounded-2xl shrink-0" />
    </div>
  )
}
