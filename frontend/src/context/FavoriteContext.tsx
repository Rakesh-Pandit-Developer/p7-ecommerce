import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

interface Product {
  _id: string;
  name: string;
  code: string;
  price: number;
  images: { url: string; alt: string }[];
  rating: { average: number; count: number };
  stock: number;
}

interface Favorite {
  _id: string;
  product: Product;
  createdAt: string;
}

interface FavoriteContextType {
  favorites: Favorite[];
  loading: boolean;
  isFavorite: (productId: string) => boolean;
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  syncFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'local_favorites';

export const FavoriteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const { user } = useAuth();

  // Get local favorites from localStorage
  const getLocalFavorites = (): string[] => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  // Save to local favorites
  const saveLocalFavorite = (productId: string) => {
    const localFavs = getLocalFavorites();
    if (!localFavs.includes(productId)) {
      localFavs.push(productId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localFavs));
    }
  };

  // Remove from local favorites
  const removeLocalFavorite = (productId: string) => {
    const localFavs = getLocalFavorites().filter((id) => id !== productId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localFavs));
  };

  const refreshFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/favorites');
      setFavorites(response.data.data);
    } catch (error: any) {
      console.error('FavoriteContext: Error fetching favorites:', error);
      // If error is 401, clear favorites
      if (error.response?.status === 401) {
        setFavorites([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId: string): boolean => {
    const token = localStorage.getItem('token');
    if (token) {
      return favorites.some((fav) => fav.product._id === productId);
    } else {
      return getLocalFavorites().includes(productId);
    }
  };

  const addToFavorites = async (productId: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Offline mode - save to localStorage
      saveLocalFavorite(productId);
      toast.success('Added to favorites (will sync after login)');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/favorites', { productId });
      setFavorites((prev) => [...prev, response.data.data]);
      toast.success('Added to favorites');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to favorites');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (productId: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Offline mode - remove from localStorage
      removeLocalFavorite(productId);
      toast.success('Removed from favorites');
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/favorites/${productId}`);
      setFavorites((prev) => prev.filter((fav) => fav.product._id !== productId));
      toast.success('Removed from favorites');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove from favorites');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const localFavs = getLocalFavorites();
    if (localFavs.length === 0) return;

    try {
      setLoading(true);
      await api.post('/favorites/sync', { productIds: localFavs });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      await refreshFavorites();
      setHasSynced(true);
      toast.success('Favorites synced successfully');
    } catch (error: any) {
      console.error('Error syncing favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Refresh favorites when user changes (login/logout)
    if (user?.id) {
      refreshFavorites();
      // Sync any local favorites when user logs in (only once per session)
      if (!hasSynced && getLocalFavorites().length > 0) {
        syncFavorites();
      }
    } else {
      setFavorites([]);
      setHasSynced(false);
    }
  }, [user?.id]); // Only depend on user ID to prevent unnecessary re-renders

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        syncFavorites,
        refreshFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
