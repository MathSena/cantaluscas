import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles.css';

export default function AdminPanel() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('karaoke_queue')
      .select('*')
      .not('status', 'eq', 'done')
      .order('position', { ascending: true });

    if (!error) setQueue(data);
  };

  const handleDelete = async (id) => {
    await supabase.from('karaoke_queue').delete().eq('id', id);
    fetchQueue();
  };

  const handlePlayNow = async (id) => {
    // Marcar atual como "done"
    const { data: current } = await supabase
      .from('karaoke_queue')
      .select('id')
      .eq('status', 'playing')
      .limit(1);

    if (current?.length > 0) {
      await supabase
        .from('karaoke_queue')
        .update({ status: 'done', is_playing: false })
        .eq('id', current[0].id);
    }

    // Pegar os outros que ainda estão waiting (exceto o novo que vai tocar)
    const { data: waiting } = await supabase
      .from('karaoke_queue')
      .select('*')
      .eq('status', 'waiting')
      .neq('id', id)
      .order('position', { ascending: true });

    const updates = waiting.map((item, index) => ({
      id: item.id,
      position: index + 1
    }));

    for (const update of updates) {
      await supabase
        .from('karaoke_queue')
        .update({ position: update.position })
        .eq('id', update.id);
    }

    // Marcar nova como "tocando agora"
    await supabase
      .from('karaoke_queue')
      .update({ is_playing: true, status: 'playing', position: 0 })
      .eq('id', id);

    fetchQueue();
  };

  return (
    <div className="card">
      <h2>🎛 Painel de Administração</h2>
      {queue.length === 0 && <p>Nenhuma música na fila.</p>}
      <ol>
        {queue.map((item) => (
          <li key={item.id}>
            <strong>{item.singer}</strong> → {item.music} ({item.artist})
            {item.status === 'playing' && <span> 🎤 <em>tocando agora</em></span>}
            <div className="admin-controls">
              {item.status === 'waiting' && (
                <button onClick={() => handlePlayNow(item.id)}>Tocar Agora</button>
              )}
              <button onClick={() => handleDelete(item.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
