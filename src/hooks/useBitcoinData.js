import { useState, useEffect } from 'react';
import { fetchBitcoinData } from '../services/api';

export const useBitcoinData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchBitcoinData();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadData();
    
    // Refresh every minute
    const interval = setInterval(loadData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};