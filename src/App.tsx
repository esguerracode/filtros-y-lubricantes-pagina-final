import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import MobileActionBar from './components/MobileActionBar';
import ScrollToTop from './components/ScrollToTop';
import IntroLoader from './components/IntroLoader';
import PageTransition from './components/PageTransition';
import { CartProvider } from './components/CartContext';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Success = lazy(() => import('./pages/Success'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Page wrapper with transition
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PageTransition>{children}</PageTransition>
);

// Track route changes for animations
const RouteChangeTracker: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
};

function App() {
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if intro was already shown
    const introShown = localStorage.getItem('intro_shown');
    if (!introShown) {
      setShowIntro(true);
    } else {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem('intro_shown', 'true');
    setShowIntro(false);
  };

  // Detector de versión para manejar propagación DNS
  useEffect(() => {
    const SITE_VERSION = 'vercel-wompi-inline-v2.1';
    const storedVersion = sessionStorage.getItem('site_version');

    if (storedVersion && storedVersion !== SITE_VERSION) {
      console.warn('⚠️ Versión desactualizada detectada. Forzando recarga del sitio...');
      sessionStorage.setItem('site_version', SITE_VERSION);
      if (storedVersion) {
        window.location.reload();
      }
    } else {
      sessionStorage.setItem('site_version', SITE_VERSION);
    }

    console.log('✅ Versión del sitio activa:', SITE_VERSION);
  }, []);

  if (showIntro === null) {
    return null; // Wait for state to initialize
  }

  return (
    <CartProvider>
      {showIntro && <IntroLoader onComplete={handleIntroComplete} />}
      
      <Router>
        <RouteChangeTracker />
        <ScrollToTop />
        <div className="min-h-screen bg-white flex flex-col">

          <Navbar />

          <main className="flex-grow">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/nosotros" element={<PageWrapper><About /></PageWrapper>} />
                <Route path="/productos" element={<PageWrapper><Products /></PageWrapper>} />
                <Route path="/producto/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
                <Route path="/contacto" element={<PageWrapper><Contact /></PageWrapper>} />
                <Route path="/carrito" element={<PageWrapper><Cart /></PageWrapper>} />
                <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
                <Route path="/success" element={<PageWrapper><Success /></PageWrapper>} />
                <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
          <div className="hidden md:block">
            <WhatsAppButton />
          </div>
          <MobileActionBar />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
