import React, { useEffect, useState } from 'react';
import {
  Container,
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabaseClient';

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
    fetchQueue();

    const channel = supabase
      .channel('realtime-admin-panel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'karaoke_queue' },
        ({ new: n }) => {
          fetchQueue();
          setNewSongInfo(`${n.singer} adicionou 🎵 "${n.music}"`);
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

    return () => supabase.removeChannel(channel);
  }, []);

  const handleDelete = async (id) => {
    await supabase.from('karaoke_queue').delete().eq('id', id);
  };

  const handlePlayNow = async (id) => {
    // marca o atual como done
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

    // reordena waiting
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

    // marca o escolhido como playing
    await supabase
      .from('karaoke_queue')
      .update({ status: 'playing', is_playing: true, position: 0 })
      .eq('id', id);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card
        elevation={4}
        sx={{
          background: 'linear-gradient(135deg, #1e1e1e, #2c2c2c)',
          borderRadius: '16px',
          color: '#fff',
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color: '#FFD700', textAlign: 'center', mb: 3 }}
          >
            🎛 Painel Administrativo
          </Typography>

          <List disablePadding>
            {queue.length === 0 ? (
              <Typography color="text.secondary" align="center">
                Nenhuma música na fila.
              </Typography>
            ) : (
              queue.map((item, index) => {
                const isPlaying = item.status === 'playing';
                return (
                  <ListItem
                    key={item.id}
                    sx={{
                      background: isPlaying ? 'rgba(255,215,0,0.1)' : '#2c2c2c',
                      borderLeft: isPlaying ? '4px solid #FFD700' : 'none',
                      borderRadius: '12px',
                      mb: 2,
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ mr: 2, color: '#FFD700', fontWeight: 'bold' }}>
                      #{index + 1}
                    </Box>
                    <ListItemText
                      primary={`${item.singer} → ${item.music}`}
                      secondary={item.artist + (isPlaying ? ' 🎤 Tocando Agora' : '')}
                      primaryTypographyProps={{ fontWeight: 'medium', color: '#fff' }}
                      secondaryTypographyProps={{ color: '#bbb' }}
                    />
                    <Stack direction="row" spacing={1}>
                      {!isPlaying && (
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handlePlayNow(item.id)}
                          sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            backgroundColor: '#5e35b1',
                            '&:hover': { backgroundColor: '#7e57c2' },
                          }}
                        >
                          Tocar Agora
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(item.id)}
                        sx={{
                          borderRadius: '12px',
                          textTransform: 'none',
                          borderColor: '#e53935',
                          '&:hover': { backgroundColor: '#4B0000', borderColor: '#e53935' },
                        }}
                      >
                        Excluir
                      </Button>
                    </Stack>
                  </ListItem>
                );
              })
            )}
          </List>
        </CardContent>
      </Card>

      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled">
          ✅ {newSongInfo}
        </Alert>
      </Snackbar>
    </Container>
  );
}
