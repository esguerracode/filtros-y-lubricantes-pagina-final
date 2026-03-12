import React from 'react';

const SkeletonLoader: React.FC = () => {
    return (
        <div 
            className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col h-full border border-gray-100" 
            role="status" 
            aria-label="Cargando producto..."
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-shimmer bg-[length:200%_100%]"></div>
            </div>

            <div className="p-4 md:p-6 flex flex-col flex-grow space-y-3">
                <div className="h-5 w-3/4 rounded-lg bg-gray-100 animate-shimmer bg-[length:200%_100%]"></div>
                <div className="h-4 w-full rounded bg-gray-100 animate-shimmer bg-[length:200%_100%]"></div>
                <div className="h-4 w-2/3 rounded bg-gray-100 animate-shimmer bg-[length:200%_100%]"></div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="h-8 w-28 rounded-lg bg-gray-100 animate-shimmer bg-[length:200%_100%]"></div>
                    <div className="h-10 w-10 rounded-xl bg-gray-100 animate-shimmer bg-[length:200%_100%]"></div>
                </div>
            </div>
            <span className="sr-only">Cargando...</span>
        </div>
    );
};

export default SkeletonLoader;
