import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
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
} from '@mui/material';
import './FootballAnimation.css';

export default function AddToQueueForm({ onMusicAdded }) {
  const [singer, setSinger] = useState('');
  const [artist, setArtist] = useState('');
  const [music, setMusic] = useState('');
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  // estados para lógica de bloqueio local
  const [lastInsertTime, setLastInsertTime] = useState(null);
  const [lastInsertSinger, setLastInsertSinger] = useState(null);

  // 1) Ouve updates de “playing” para notificar quem está tocando
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
              message: `🎶 Agora tocando: ${newData.singer} - "${newData.music}"`,
              type: 'info',
            });
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // 2) Se outro cantor adicionar, limpa o bloqueio
  useEffect(() => {
    if (!lastInsertSinger) return;
    const channelIns = supabase
      .channel('realtime-insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'karaoke_queue' },
        (payload) => {
          if (payload.new.singer !== lastInsertSinger) {
            setLastInsertTime(null);
            setLastInsertSinger(null);
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channelIns);
  }, [lastInsertSinger]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const singerName = singer.trim();
    const artistName = artist.trim();
    const musicName  = music.trim();

    // Validação básica
    if (!singerName || !artistName || !musicName) {
      setNotification({ open: true, message: 'Todos os campos são obrigatórios!', type: 'error' });
      return;
    }

    // Bloqueio de 5 minutos se for a MESMA pessoa e ninguém entrou na fila entre
    if (lastInsertTime && lastInsertSinger === singerName) {
      const diffMin = (Date.now() - lastInsertTime) / 1000 / 60;
      if (diffMin < 5) {
        const wait = Math.ceil(5 - diffMin);
        setNotification({
          open: true,
          message: `⏳ Espere mais ${wait} min antes de adicionar outra.`,
          type: 'warning',
        });
        return;
      }
    }

    // Calcula próxima posição
    const { data: maxPosData, error: errPos } = await supabase
      .from('karaoke_queue')
      .select('position')
      .eq('status', 'waiting')
      .order('position', { ascending: false })
      .limit(1);
    if (errPos) console.error('Erro ao buscar posição:', errPos);
    const nextPosition = (maxPosData?.[0]?.position ?? 0) + 1;

    // Insere nova música
    const { error: errInsert } = await supabase
      .from('karaoke_queue')
      .insert([{
        singer: singerName,
        artist: artistName,
        music: musicName,
        position: nextPosition,
        status: 'waiting',
        is_playing: false,
      }]);

    if (errInsert) {
      console.error('Erro ao adicionar música:', errInsert);
      setNotification({ open: true, message: 'Erro ao adicionar música. Tente novamente.', type: 'error' });
    } else {
      // marca localmente o momento e quem inseriu
      setLastInsertTime(Date.now());
      setLastInsertSinger(singerName);

      // conta quantas músicas estão na fila (waiting + playing)
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

      setNotification({ open: true, message: `🎵 Música adicionada: ${singerName} - "${musicName}"`, type: 'success' });
      setTimeout(() => setOpen(false), 10000);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(135deg, #1e1e1e, #2c2c2c)', borderRadius: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Quem vai cantar"
            fullWidth
            value={singer}
            onChange={e => setSinger(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <TextField
            label="Artista original"
            fullWidth
            value={artist}
            onChange={e => setArtist(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <TextField
            label="Nome da música"
            fullWidth
            value={music}
            onChange={e => setMusic(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <Button
            variant="contained"
            type="submit"
            size="large"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#5e35b1' } }}
          >
            🎵 Adicionar à Fila
          </Button>
        </Stack>
      </form>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, bgcolor: 'background.paper', borderRadius: '12px', p: 4, textAlign: 'center' }}>
          <div className="football-animation">
            <img src="/ball.webp" alt="Football" className="football" />
          </div>
          <Typography variant="h6" fontWeight="bold">🎉 Música adicionada com sucesso!</Typography>
          <Typography sx={{ mt: 1 }}>Faltam <strong>{remaining}</strong> músicas antes da sua vez.</Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => setOpen(false)}>Fechar</Button>
        </Box>
      </Modal>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.type} variant="filled">{notification.message}</Alert>
      </Snackbar>
    </Paper>
  );
}
