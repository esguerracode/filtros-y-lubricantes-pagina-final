import { useEffect, useState } from 'react';
import { Product, Category } from '../types';
import ProductCard from './ProductCard';

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const consumerKey = import.meta.env.VITE_WC_KEY as string;
    const consumerSecret = import.meta.env.VITE_WC_SECRET as string;

    if (!consumerKey || !consumerSecret) {
      setError('Faltan claves de API en .env');
      setLoading(false);
      return;
    }

    fetch(
      `https://filtrosylubricantes.co/wp-json/wc/v3/products?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        const mappedProducts: Product[] = data.map((wooProduct) => ({
          id: wooProduct.id,
          name: wooProduct.name,
          price: parseFloat(wooProduct.price) || 0,
          category: mapWooCategory(wooProduct.categories),
          description: wooProduct.short_description || wooProduct.description || '',
          specs: wooProduct.attributes?.length > 0
            ? wooProduct.attributes.map((a: any) => `${a.name}: ${a.options.join(', ')}`).join(' | ')
            : undefined,
          image: wooProduct.images?.[0]?.src || '/placeholder.jpg'
        }));

        setProducts(mappedProducts);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const mapWooCategory = (categories: any[]): Category => {
    if (!categories || categories.length === 0) return Category.LUBRICANTES;

    const catName = categories[0].name.toLowerCase();
    if (catName.includes('aceite') || catName.includes('oil')) return Category.FILTROS_ACEITE;
    if (catName.includes('aire') && catName.includes('motor')) return Category.FILTROS_AIRE_MOTOR;
    if (catName.includes('aire') || catName.includes('cabina') || catName.includes('acondicionado')) return Category.FILTROS_AIRE_AC;
    if (catName.includes('combustible') || catName.includes('fuel')) return Category.FILTROS_COMBUSTIBLE;
    if (catName.includes('lubricante') || catName.includes('aceite')) return Category.LUBRICANTES;
    if (catName.includes('kit')) return Category.KITS;
    return Category.LUBRICANTES;
  };

  if (loading) {
    return <div className="text-center py-20 text-xl">Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-center text-gray-900 mb-4">
        Catálogo de Productos
      </h1>
      <p className="text-center text-gray-600 mb-12">
        {products.length} productos disponibles
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
