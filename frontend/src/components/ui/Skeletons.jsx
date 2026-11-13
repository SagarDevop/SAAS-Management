import React from 'react';

// Reusable Pulse Box
export const SkeletonBox = ({ className = '' }) => (
  <div className={`bg-slate-200/70 animate-pulse rounded-sm ${className}`} />
);

// Dashboard Skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="bg-white p-5 border border-surface-border rounded-sm shadow-sm flex flex-col sm:flex-row justify-between gap-4">
      <div className="space-y-2">
        <SkeletonBox className="h-5 w-32" />
        <SkeletonBox className="h-7 w-64" />
        <SkeletonBox className="h-4 w-48" />
      </div>
      <SkeletonBox className="h-14 w-52" />
    </div>

    {/* 3 Quick Action Skeletons */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <SkeletonBox className="h-16 w-full" />
      <SkeletonBox className="h-16 w-full" />
      <SkeletonBox className="h-16 w-full" />
    </div>

    {/* Metric Cards Skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 bg-white border border-surface-border rounded-sm space-y-2">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-8 w-16" />
          <SkeletonBox className="h-3 w-28" />
        </div>
      ))}
    </div>

    {/* Bottom Table Skeleton */}
    <div className="bg-white border border-surface-border p-5 rounded-sm space-y-3">
      <SkeletonBox className="h-5 w-40" />
      <SkeletonBox className="h-10 w-full" />
      <SkeletonBox className="h-10 w-full" />
      <SkeletonBox className="h-10 w-full" />
    </div>
  </div>
);

// Attendance Page Skeleton
export const AttendanceSkeleton = () => (
  <div className="space-y-5">
    <div className="bg-white p-5 border border-surface-border rounded-sm space-y-3">
      <div className="flex justify-between">
        <SkeletonBox className="h-6 w-52" />
        <SkeletonBox className="h-8 w-44" />
      </div>
      <div className="flex gap-2">
        <SkeletonBox className="h-7 w-28" />
        <SkeletonBox className="h-7 w-28" />
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBox key={i} className="h-16 w-full bg-white border border-surface-border" />
      ))}
    </div>

    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 bg-white border border-surface-border rounded-sm space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <SkeletonBox className="w-10 h-10 rounded-sm" />
              <div className="space-y-1.5">
                <SkeletonBox className="h-4 w-32" />
                <SkeletonBox className="h-3 w-24" />
              </div>
            </div>
            <SkeletonBox className="h-5 w-16" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <SkeletonBox className="h-9 w-full" />
            <SkeletonBox className="h-9 w-full" />
            <SkeletonBox className="h-9 w-full" />
            <SkeletonBox className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Workers / Wallet List Skeleton
export const ListSkeleton = () => (
  <div className="space-y-5">
    <div className="bg-white p-4 border border-surface-border rounded-sm flex justify-between items-center">
      <div className="space-y-1.5">
        <SkeletonBox className="h-5 w-40" />
        <SkeletonBox className="h-3 w-60" />
      </div>
      <SkeletonBox className="h-9 w-32" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBox key={i} className="h-20 bg-white border border-surface-border" />
      ))}
    </div>

    <div className="bg-white border border-surface-border p-5 rounded-sm space-y-3">
      <SkeletonBox className="h-8 w-72" />
      <SkeletonBox className="h-12 w-full" />
      <SkeletonBox className="h-12 w-full" />
      <SkeletonBox className="h-12 w-full" />
      <SkeletonBox className="h-12 w-full" />
    </div>
  </div>
);

