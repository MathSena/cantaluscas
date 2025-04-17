import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  TextField,
  Button,
  Stack,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';

export default function AddToQueueForm({ onMusicAdded }) {
  const [singer, setSinger] = useState('');
  const [artist, setArtist] = useState('');
  const [music, setMusic] = useState('');
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

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

    if (!error) {
      setPosition(nextPosition);
      setOpen(true);
      setSinger('');
      setArtist('');
      setMusic('');
      onMusicAdded?.();
    } else {
      console.error('Erro ao inserir:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, backgroundColor: 'background.paper' }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Nome de quem vai cantar"
            variant="outlined"
            fullWidth
            value={singer}
            onChange={(e) => setSinger(e.target.value)}
          />
          <TextField
            label="Artista original"
            variant="outlined"
            fullWidth
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
          <TextField
            label="Nome da música"
            variant="outlined"
            fullWidth
            value={music}
            onChange={(e) => setMusic(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="large"
          >
            🎵 Adicionar à Fila
          </Button>
        </Stack>
      </form>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setOpen(false)}
        >
          Música adicionada com sucesso! 🎉<br />
          Sua posição na fila é: {position}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
