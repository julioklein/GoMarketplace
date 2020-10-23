import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@gomarketplace:cart',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const currentProducts = [...products];
      const findProduct = currentProducts.find(
        currentProduct => currentProduct.id === product.id,
      );

      if (findProduct) {
        findProduct.quantity += 1;
      } else {
        currentProducts.push({ ...product, quantity: 1 });
      }

      setProducts(currentProducts);

      await AsyncStorage.setItem(
        '@gomarketplace:cart',
        JSON.stringify(currentProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const currentProducts = [...products];
      const findProduct = currentProducts.find(
        currentProduct => currentProduct.id === id,
      );

      if (findProduct) {
        findProduct.quantity += 1;
      }

      setProducts(currentProducts);

      await AsyncStorage.setItem(
        '@gomarketplace:cart',
        JSON.stringify(currentProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const findProduct = products.find(product => product.id === id);
      const restProducts = products.filter(product => product.id !== id);
      let updatedProducts = [];

      if (findProduct && findProduct.quantity > 1) {
        updatedProducts = [
          ...restProducts,
          { ...findProduct, quantity: findProduct.quantity - 1 },
        ];
      } else {
        updatedProducts = [...restProducts];
      }

      setProducts(updatedProducts);
      await AsyncStorage.setItem(
        '@gomarketplace:cart',
        JSON.stringify(updatedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
