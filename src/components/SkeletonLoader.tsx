import React from 'react';

const SkeletonLoader: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full border border-gray-100 animate-pulse">
            {/* Imagen skeleton */}
            <div className="relative aspect-square overflow-hidden bg-gray-200">
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <div className="bg-gray-300 h-5 w-20 rounded-full"></div>
                    <div className="bg-gray-300 h-5 w-24 rounded-full"></div>
                </div>
            </div>

            {/* Contenido skeleton */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="bg-gray-200 h-5 w-3/4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 w-full rounded mb-1"></div>
                <div className="bg-gray-200 h-4 w-2/3 rounded mb-3"></div>

                <div className="flex items-center justify-between mt-auto mb-4">
                    <div className="bg-gray-300 h-6 w-24 rounded"></div>
                </div>

                <div className="bg-gray-200 h-10 w-full rounded-lg"></div>
            </div>
        </div>
    );
};

export default SkeletonLoader;
