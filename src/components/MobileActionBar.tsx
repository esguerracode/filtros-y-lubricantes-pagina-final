
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart } from './CartContext';
import { CONTACT_INFO } from '../constants';

const MobileActionBar: React.FC = () => {
    const location = useLocation();
    const { totalItems } = useCart();

    const handleWhatsApp = () => {
        window.open(CONTACT_INFO.officialLink, '_blank');
    };

    const navItems = [
        { label: 'Inicio', icon: <Home size={24} />, path: '/' },
        { label: 'Catálogo', icon: <Package size={24} />, path: '/productos' },
        {
            label: 'Carrito', icon: (
                <div className="relative">
                    <ShoppingCart size={24} />
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#FF8C42] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-emerald-950">
                            {totalItems}
                        </span>
                    )}
                </div>
            ), path: '/carrito'
        },
    ];

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pb-safe transition-all duration-500 transform [.menu-open_&]:translate-y-24 [.menu-open_&]:opacity-0 pointer-events-auto [.menu-open_&]:pointer-events-none">
            <div className="neo-glass-dark rounded-[2rem] flex items-center justify-between p-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-all duration-300 rounded-xl active:bg-white/10 active:animate-spring ${isActive ? 'text-brand-yellow font-black' : 'text-white/60 font-bold hover:text-white'
                                }`}
                        >
                            <div className="transform scale-90 md:scale-100">{item.icon}</div>
                            <span className="text-[9px] uppercase tracking-tighter mt-0.5">{item.label}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={handleWhatsApp}
                    className="flex flex-col items-center justify-center flex-1 py-1.5 text-[#4ADE80] transition-colors relative"
                >
                    <div className="relative transform scale-90 md:scale-100">
                        <MessageCircle size={24} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#4ADE80] rounded-full border-2 border-emerald-950 animate-pulse"></span>
                    </div>
                    <span className="text-[9px] uppercase tracking-tighter mt-0.5 font-black">WhatsApp</span>
                </button>
            </div>
        </div>
    );
};

export default MobileActionBar;
