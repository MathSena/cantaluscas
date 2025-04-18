import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';

export default function AdminPanel() {
  const [queue, setQueue] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [newSongInfo, setNewSongInfo] = useState('');

  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('karaoke_queue')
      .select('*')
      .not('status', 'eq', 'done')
      .order('position', { ascending: true });

    if (error) console.error('Erro ao carregar fila:', error);
    else setQueue(data || []);
  };

  useEffect(() => {
    fetchQueue(); // busca inicial

    const channel = supabase
      .channel('realtime-admin-panel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'karaoke_queue' },
        (payload) => {
          fetchQueue();
          const { singer, music } = payload.new;
          setNewSongInfo(`${singer} adicionou 🎵 ${music}`);
          setShowNotification(true);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'karaoke_queue' },
        () => fetchQueue()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'karaoke_queue' },
        () => fetchQueue()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('karaoke_queue')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao deletar:', error);
  };

  const handlePlayNow = async (id) => {
    const { data: current } = await supabase
      .from('karaoke_queue')
      .select('id')
      .eq('status', 'playing')
      .limit(1);
    if (current?.length) {
      await supabase
        .from('karaoke_queue')
        .update({ status: 'done', is_playing: false })
        .eq('id', current[0].id);
    }

    const { data: waiting } = await supabase
      .from('karaoke_queue')
      .select('*')
      .eq('status', 'waiting')
      .neq('id', id)
      .order('position');

    for (const [i, item] of waiting.entries()) {
      await supabase
        .from('karaoke_queue')
        .update({ position: i + 1 })
        .eq('id', item.id);
    }

    await supabase
      .from('karaoke_queue')
      .update({ is_playing: true, status: 'playing', position: 0 })
      .eq('id', id);
  };

  return (
    <Box
      sx={{
        maxWidth: { xs: '100%', sm: '600px', md: '800px' }, // Responsivo: largura total em telas pequenas, 600px em médias e 800px em grandes
        margin: '0 auto', // Centraliza horizontalmente
        padding: { xs: '8px', sm: '16px' }, // Padding responsivo
      }}
    >
      <Card
        elevation={4}
        sx={{
          background: 'linear-gradient(135deg, #1e1e1e, #2c2c2c)',
          borderRadius: '16px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
          color: '#ffffff',
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              color: '#FFD700',
              marginBottom: '16px',
              textAlign: 'center',
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            🎛 Painel Administrativo
          </Typography>
          <List>
            {queue.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{
                  textAlign: 'center',
                  marginTop: '16px',
                }}
              >
                Nenhuma música na fila.
              </Typography>
            ) : (
              queue.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    backgroundColor: '#2c2c2c',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    padding: '12px',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={`${item.singer} → ${item.music}`}
                    secondary={item.artist + (item.status === 'playing' ? ' 🎤 Tocando Agora' : '')}
                    primaryTypographyProps={{
                      fontWeight: 'bold',
                      color: '#ffffff',
                    }}
                    secondaryTypographyProps={{
                      color: '#b0b0b0',
                    }}
                  />
<Stack direction="row" spacing={1}>
  {item.status === 'waiting' && (
    <Button
      variant="contained"
      color="primary"
      onClick={() => handlePlayNow(item.id)}
      sx={{
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 'bold',
        backgroundColor: '#5e35b1',
        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }, // Tamanho responsivo do texto
        padding: { xs: '6px 12px', sm: '8px 16px', md: '10px 20px' }, // Padding responsivo
        '&:hover': {
          backgroundColor: '#7e57c2',
        },
      }}
    >
      ▶️ Tocar Agora
    </Button>
  )}
  <Button
    variant="outlined"
    color="error"
    onClick={() => handleDelete(item.id)}
    sx={{
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 'bold',
      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }, // Tamanho responsivo do texto
      padding: { xs: '6px 12px', sm: '8px 16px', md: '10px 20px' }, // Padding responsivo
      borderWidth: { xs: '1px', sm: '1.5px', md: '2px' }, // Espessura da borda responsiva
      '&:hover': {
        backgroundColor: '#4B0082',
        color: '#ffffff',
      },
    }}
  >
    Excluir
  </Button>
</Stack>
                </ListItem>
              ))
            )}
          </List>
        </CardContent>
      </Card>

      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowNotification(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          ✅ {newSongInfo}
        </Alert>
      </Snackbar>
    </Box>
  );
}