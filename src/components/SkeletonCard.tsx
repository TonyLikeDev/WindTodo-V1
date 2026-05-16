"use client";

export default function SkeletonCard() {
  return (
    <div className="cake-card p-7 bg-white animate-pulse">
      <div className="flex justify-between items-start mb-5">
        <div className="flex gap-2">
          <div className="w-20 h-6 bg-pink-50 rounded-full"></div>
          <div className="w-16 h-6 bg-pink-50 rounded-full"></div>
        </div>
        <div className="w-8 h-8 bg-pink-50 rounded-full"></div>
      </div>
      
      <div className="w-5/6 h-7 bg-pink-50 rounded-xl mb-4"></div>
      <div className="w-2/3 h-5 bg-pink-50 rounded-xl mb-8"></div>
      
      <div className="flex items-center justify-between pt-5 border-t border-pink-50">
        <div className="w-24 h-4 bg-pink-50 rounded-lg"></div>
        <div className="w-16 h-5 bg-pink-50 rounded-full"></div>
      </div>
    </div>
  );
}

