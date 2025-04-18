import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  TextField,
  Button,
  Stack,
  Paper,
  Modal,
  Box,
  Typography,
} from '@mui/material';
import './FootballAnimation.css'; // Arquivo CSS para a animação

export default function AddToQueueForm({ onMusicAdded }) {
  const [singer, setSinger] = useState('');
  const [artist, setArtist] = useState('');
  const [music, setMusic] = useState('');
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [remaining, setRemaining] = useState(0);

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

    const { data: waitingData } = await supabase
      .from('karaoke_queue')
      .select('*')
      .or('status.eq.waiting,status.eq.playing');

    const { error } = await supabase.from('karaoke_queue').insert([
      {
        singer,
        artist,
        music,
        position: nextPosition,
        status: 'waiting',
        is_playing: false,
      },
    ]);

    if (!error) {
      setPosition(nextPosition);
      setRemaining(waitingData.length);
      setOpen(true);
      setSinger('');
      setArtist('');
      setMusic('');
      onMusicAdded?.();

      // Fecha o modal automaticamente após 10 segundos
      setTimeout(() => setOpen(false), 10000);
    } else {
      console.error('Erro ao inserir:', error);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        background: 'linear-gradient(135deg, #1e1e1e, #2c2c2c)',
        borderRadius: '16px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Nome de quem vai cantar"
            variant="outlined"
            fullWidth
            value={singer}
            onChange={(e) => setSinger(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
          <TextField
            label="Artista original"
            variant="outlined"
            fullWidth
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
          <TextField
            label="Nome da música"
            variant="outlined"
            fullWidth
            value={music}
            onChange={(e) => setMusic(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 'bold',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: '#5e35b1',
              },
            }}
          >
            🎵 Adicionar à Fila
          </Button>
        </Stack>
      </form>

      {/* Modal para exibir posição na fila */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: '12px',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          <div className="football-animation">
            <img src="/ball.webp" alt="Football" className="football" />
          </div>
          <Typography id="modal-title" variant="h6" fontWeight="bold">
            🎉 Música adicionada com sucesso!
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Sua posição na fila é: <strong>{position}</strong>
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Faltam <strong>{remaining}</strong> músicas para você cantar.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => setOpen(false)}
          >
            Fechar
          </Button>
        </Box>
      </Modal>
    </Paper>
  );
}