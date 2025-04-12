import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles.css';

export default function QueueDisplay() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    fetchQueue();

    const subscription = supabase
      .channel('karaoke_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_queue' }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('karaoke_queue')
      .select('*')
      .or('status.eq.waiting,status.eq.playing')
      .order('position', { ascending: true });

    if (!error) setQueue(data);
  };

  const current = queue.find(q => q.status === 'playing');
  const upcoming = queue.filter(q => q.status === 'waiting');

  return (
    <div className="card">
      <h2>🎤 Agora cantando:</h2>
      {current ? (
        <p>
          <strong>{current.singer}</strong> cantando <em>{current.music}</em> de {current.artist}
        </p>
      ) : (
        <p>Ninguém está cantando no momento.</p>
      )}

      <h2>🎶 Próximas músicas:</h2>
      <ul>
        {upcoming.slice(0, 3).map((item) => (
          <li key={item.id}>
            {item.singer} → {item.music} ({item.artist})
          </li>
        ))}
      </ul>

      <h2>📋 Fila completa:</h2>
      <ol>
        {[...queue].sort((a, b) => a.position - b.position).map((item) => (
          <li key={item.id}>
            {item.singer} → {item.music} ({item.artist}) {item.status === 'playing' && '🎤'}
          </li>
        ))}
      </ol>
    </div>
  );
}
