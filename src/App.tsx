import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import MobileActionBar from './components/MobileActionBar';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './components/CartContext';
import PropagationBanner from './components/PropagationBanner';

function App() {
  // Detector de versión para manejar propagación DNS
  useEffect(() => {
    const SITE_VERSION = 'vercel-wompi-inline-v2.0';
    const storedVersion = sessionStorage.getItem('site_version');

    // Si la versión no coincide, estamos probablemente viendo una versión cacheada o del servidor viejo
    if (storedVersion && storedVersion !== SITE_VERSION) {
      console.warn('⚠️ Versión desactualizada detectada. Forzando recarga del sitio...');
      sessionStorage.setItem('site_version', SITE_VERSION);
      // Solo recargar si realmente hay un cambio previo guardado
      if (storedVersion) {
        window.location.reload();
      }
    } else {
      sessionStorage.setItem('site_version', SITE_VERSION);
    }

    console.log('✅ Versión del sitio activa:', SITE_VERSION);
  }, []);

  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white flex flex-col">
          <PropagationBanner />
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/nosotros" element={<About />} />
              <Route path="/productos" element={<Products />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
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
