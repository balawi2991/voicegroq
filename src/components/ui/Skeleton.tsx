'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white/10 rounded-lg',
        animate && 'animate-pulse',
        className
      )}
    />
  );
}

// Skeleton للوحة التحكم الرئيسية
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* العنوان */}
      <div className="text-center lg:text-right">
        <Skeleton className="h-10 w-64 mx-auto lg:mx-0 mb-2" />
        <Skeleton className="h-6 w-96 mx-auto lg:mx-0" />
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* كود التضمين */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>

        {/* معاينة البوت */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-full mb-6" />
          <div className="flex justify-center items-center min-h-[200px] bg-black/20 rounded-lg border border-white/5">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>
          <div className="mt-6 text-center">
            <Skeleton className="h-10 w-32 mx-auto" />
          </div>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-auto p-4 flex-col gap-2 bg-white/5 rounded-xl border border-white/10">
              <Skeleton className="w-8 h-8 mx-auto mb-2" />
              <Skeleton className="h-5 w-24 mx-auto mb-1" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton لصفحة التخصيص
export function AppearanceSkeleton() {
  return (
    <div className="space-y-8">
      {/* العنوان */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* إعدادات التخصيص */}
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-4 w-64" />
            </div>
          ))}
        </div>

        {/* معاينة المساعد */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 h-fit sticky top-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-full mb-6" />
          <div className="flex justify-center items-center min-h-[300px] bg-black/20 rounded-lg border border-white/5">
            <Skeleton className="w-32 h-32 rounded-full" />
          </div>
          <div className="mt-6 text-center">
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton لصفحة المعرفة
export function KnowledgeSkeleton() {
  return (
    <div className="space-y-8">
      {/* العنوان */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-5 w-96" />
      </div>

      {/* منطقة الرفع */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border-2 border-dashed border-white/20">
        <div className="text-center">
          <Skeleton className="w-16 h-16 mx-auto mb-4" />
          <Skeleton className="h-6 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto mb-6" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>

      {/* قائمة الملفات */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <Skeleton className="w-8 h-8" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-8 h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton عام للصفحات
export function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-10 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
