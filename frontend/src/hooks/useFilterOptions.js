import { useState, useEffect } from 'react';
import { salesAPI } from '../services/api';

const useFilterOptions = () => {
  const [options, setOptions] = useState({
    regions: [],
    genders: [],
    categories: [],
    tags: [],
    paymentMethods: [],
    ageRange: { minAge: 0, maxAge: 100 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await salesAPI.getFilterOptions();
        setOptions(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch filter options');
        console.error('Error fetching filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { options, loading, error };
};

export default useFilterOptions;

