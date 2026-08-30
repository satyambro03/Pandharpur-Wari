import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MOCK_POIS } from '../lib/mockData';

export function usePOI() {
  const [pois, setPois] = useState(MOCK_POIS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPOIs() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('poi_camps')
          .select('*');

        if (!error && data?.length > 0) {
          setPois(data);
        }
      } catch (e) {
        console.warn('Using mock POI data:', e);
      }
      setLoading(false);
    }

    fetchPOIs();
  }, []);

  return { pois, loading };
}
