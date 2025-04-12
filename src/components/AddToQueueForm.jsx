import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles.css';

export default function AddToQueueForm() {
  const [singer, setSinger] = useState('');
  const [artist, setArtist] = useState('');
  const [music, setMusic] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!singer || !artist || !music) return;

    const { data: maxPosData } = await supabase
      .from('karaoke_queue')
      .select('position')
      .eq('status', 'waiting')
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (maxPosData?.[0]?.position ?? 0) + 1;

    const { error } = await supabase.from('karaoke_queue').insert([
      {
        singer,
        artist,
        music,
        position: nextPosition,
        status: 'waiting',
        is_playing: false
      }
    ]);

    if (error) {
      console.error('Erro ao inserir:', error);
    } else {
      setSinger('');
      setArtist('');
      setMusic('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input
        type="text"
        placeholder="Nome do cantor(a)"
        value={singer}
        onChange={(e) => setSinger(e.target.value)}
      />
      <input
        type="text"
        placeholder="Artista original"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />
      <input
        type="text"
        placeholder="Nome da música"
        value={music}
        onChange={(e) => setMusic(e.target.value)}
      />
      <button type="submit">Adicionar à fila</button>
    </form>
  );
}
