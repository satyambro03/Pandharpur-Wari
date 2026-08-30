import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MOCK_ROUTES } from '../lib/mockData';

export function useCrowdDensity() {
  const [routes, setRoutes] = useState(MOCK_ROUTES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    async function fetchRoutes() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('crowd_density')
          .select('*')
          .order('route_id');

        if (!error && data?.length > 0) {
          setRoutes(data);
        }
      } catch (e) {
        console.warn('Using mock crowd data:', e);
      }
      setLoading(false);

      // Subscribe to realtime updates
      channel = supabase
        .channel('crowd_density_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crowd_density' }, payload => {
          setRoutes(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(r => r.route_id === payload.new.route_id);
            if (idx >= 0) {
              updated[idx] = payload.new;
            } else {
              updated.push(payload.new);
            }
            return updated;
          });
        })
        .subscribe();
    }

    fetchRoutes();

    return () => {
      if (channel) supabase?.removeChannel(channel);
    };
  }, []);

  return { routes, loading };
}
