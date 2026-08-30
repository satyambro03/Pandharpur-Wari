import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSOSAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    async function fetchAlerts() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('sos_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          setAlerts(data);
        }
      } catch (e) {
        console.warn('Error fetching SOS alerts:', e);
      }
      setLoading(false);

      // Subscribe to realtime
      channel = supabase
        .channel('sos_alerts_changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts' }, payload => {
          setAlerts(prev => [payload.new, ...prev]);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sos_alerts' }, payload => {
          setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
        })
        .subscribe();
    }

    fetchAlerts();

    return () => {
      if (channel) supabase?.removeChannel(channel);
    };
  }, []);

  const updateAlert = async (id, status) => {
    if (!supabase) return;
    await supabase.from('sos_alerts').update({ status }).eq('id', id);
  };

  return { alerts, loading, updateAlert };
}
