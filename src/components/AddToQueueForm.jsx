import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Stack,
  Paper,
  Modal,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Container,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import { supabase } from '../supabaseClient';
import './FootballAnimation.css';

export default function AddToQueueForm({ onMusicAdded }) {
  const [singer, setSinger] = useState('');
  const [artist, setArtist] = useState('');
  const [music, setMusic] = useState('');
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const [loading, setLoading] = useState(false);

  // Notificação “Agora tocando”
  useEffect(() => {
    const channel = supabase
      .channel('realtime-playing')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'karaoke_queue' },
        ({ new: newData }) => {
          if (newData.status === 'playing') {
            setNotification({
              open: true,
              message: `🎶 Agora tocando: ${newData.singer} – "${newData.music}"`,
              type: 'info',
            });
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const s = singer.trim();
    const a = artist.trim();
    const m = music.trim();
    if (!s || !a || !m) {
      setNotification({ open: true, message: 'Preencha todos os campos!', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Calcula posição
      const { data: maxPos } = await supabase
        .from('karaoke_queue')
        .select('position')
        .eq('status', 'waiting')
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (maxPos?.[0]?.position ?? 0) + 1;

      // Insere a música
      await supabase.from('karaoke_queue').insert([
        {
          singer: s,
          artist: a,
          music: m,
          position: nextPosition,
          status: 'waiting',
          is_playing: false,
        },
      ]);

      // Conta quantas músicas existem
      const { count } = await supabase
        .from('karaoke_queue')
        .select('id', { count: 'exact', head: true })
        .or('status.eq.waiting,status.eq.playing');

      setRemaining((count ?? 1) - 1);
      setOpen(true);
      setSinger('');
      setArtist('');
      setMusic('');
      onMusicAdded?.();

      setNotification({ open: true, message: `🎵 "${m}" adicionada!`, type: 'success' });
      setTimeout(() => setOpen(false), 10000);
    } catch (err) {
      console.error(err);
      setNotification({ open: true, message: 'Erro, tente de novo.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #1e1e1e, #2c2c2c)',
          borderRadius: '16px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              placeholder="Ex: João Silva"
              label="Quem vai cantar"
              fullWidth
              value={singer}
              onChange={(e) => setSinger(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' },
              }}
            />
            <TextField
              placeholder="Ex: The Beatles"
              label="Artista original"
              fullWidth
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MusicNoteIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' },
              }}
            />
            <TextField
              placeholder="Ex: Hey Jude"
              label="Nome da música"
              fullWidth
              value={music}
              onChange={(e) => setMusic(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LibraryMusicIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' },
              }}
            />
            <Button
              variant="contained"
              type="submit"
              size="large"
              disabled={loading}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#5e35b1' },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '🎵 Adicionar à fila'}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Modal de sucesso */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: '12px',
            p: 4,
            textAlign: 'center',
          }}
        >
          <div className="football-animation">
            <img src="/ball.webp" alt="Football" className="football" />
          </div>
          <Typography variant="h6" fontWeight="bold">
            🎉 Música adicionada!
          </Typography>
          <Typography sx={{ mt: 1 }}>
Você vai cantar daqui <strong>{remaining}</strong> músicas
          </Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.type} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}