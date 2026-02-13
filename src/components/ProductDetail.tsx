import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from './CartContext';

interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  images: { src: string }[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const key = import.meta.env.VITE_WC_KEY as string;
    const secret = import.meta.env.VITE_WC_SECRET as string;

    if (!key || !secret) {
      setError('Faltan claves de API en .env');
      setLoading(false);
      return;
    }

    fetch(
      `https://filtrosylubricantes.co/wp-json/wc/v3/products/${id}?consumer_key=${key}&consumer_secret=${secret}`
    )
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return <div style={{ padding: 40 }}>Cargando producto...</div>;
  if (error)
    return (
      <div style={{ padding: 40, color: 'red' }}>
        Error: {error}
      </div>
    );
  if (!product)
    return <div style={{ padding: 40 }}>Producto no encontrado</div>;

  const handleAddToCart = () => {
    const mainImage = product.images[0]?.src ?? '';
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: mainImage,
    } as any);
  };

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
      }}
    >
      <div>
        {product.images[0] && (
          <img
            src={product.images[0].src}
            alt={product.name}
            style={{
              width: '100%',
              maxHeight: 450,
              objectFit: 'cover',
              borderRadius: '10px',
              marginBottom: '10px',
            }}
          />
        )}
      </div>

      <div>
        <h1
          style={{
            fontSize: '26px',
            marginBottom: '10px',
            color: '#333',
          }}
        >
          {product.name}
        </h1>

        <p
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#e74c3c',
            margin: '10px 0 20px',
          }}
        >
          ${product.price}
        </p>

        <div
          dangerouslySetInnerHTML={{ __html: product.description }}
          style={{ lineHeight: 1.6, color: '#555', marginBottom: '30px' }}
        />

        <button
          onClick={handleAddToCart}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: 16,
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = '#2980b9')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor = '#3498db')
          }
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
