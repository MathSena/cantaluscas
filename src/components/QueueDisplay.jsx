import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { supabase } from '../supabaseClient';

export default function QueueDisplay({ reload }) {
  const [queue, setQueue] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  // busca a fila do supabase
  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('karaoke_queue')
      .select('*')
      .or('status.eq.waiting,status.eq.playing')
      .order('position', { ascending: true });
    if (error) {
      console.error(error);
    } else {
      setQueue(data || []);
    }
  };

  // 1) monta listener apenas uma vez para updates/insert/delete
  useEffect(() => {
    fetchQueue();
    const channel = supabase
      .channel('realtime-queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_queue' }, (payload) => {
        fetchQueue();
        if (payload.eventType === 'INSERT') {
          setNotification({
            open: true,
            message: `🎵 Nova música: ${payload.new.singer} – "${payload.new.music}"`,
            type: 'success',
          });
        }
        if (payload.eventType === 'DELETE') {
          setNotification({
            open: true,
            message: `❌ Música removida: ${payload.old.singer} – "${payload.old.music}"`,
            type: 'warning',
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2) dispara fetchQueue sempre que reload mudar
  useEffect(() => {
    fetchQueue();
  }, [reload]);

  const current = queue.find((q) => q.status === 'playing');
  const upcoming = queue.filter((q) => q.status === 'waiting');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card
        elevation={3}
        sx={{
          background: 'linear-gradient(135deg, #1e1e1e, #2c2c2c)',
          borderLeft: '4px solid #FFD700',
          borderRadius: '16px',
          color: '#fff',
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#FFD700', mb: 2 }}>
            🎤 Agora cantando:
          </Typography>
          {current ? (
            <Typography variant="h6">
              <strong>{current.singer}</strong> cantando <em>{current.music}</em> ({current.artist})
            </Typography>
          ) : (
            <Typography color="text.secondary">Ninguém está cantando no momento.</Typography>
          )}
        </CardContent>
      </Card>

      <Typography variant="h5" fontWeight="bold" sx={{ color: '#FFD700', mt: 4, mb: 2 }}>
        🎶 Próximas músicas:
      </Typography>
      <List>
        {upcoming.map((item, i) => (
          <ListItem
            key={item.id}
            sx={{
              background: i === 0 ? 'rgba(255,255,255,0.1)' : '#2c2c2c',
              borderRadius: '12px',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              pl: 2,
            }}
          >
            <Box sx={{ mr: 2, color: '#FFD700', fontWeight: 'bold' }}>#{i + 1}</Box>
            <MusicNoteIcon sx={{ mr: 1 }} />
            <ListItemText
              primary={`${item.singer} → ${item.music}`}
              secondary={item.artist}
              primaryTypographyProps={{ fontWeight: 'medium', color: '#fff' }}
              secondaryTypographyProps={{ color: '#bbb' }}
            />
          </ListItem>
        ))}
      </List>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.type} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
