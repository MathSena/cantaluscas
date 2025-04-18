import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';

export default function QueueDisplay({ reload }) {
  const [queue, setQueue] = useState([]);

  // função de busca extraída, não é async no useEffect
  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('karaoke_queue')
      .select('*')
      .or('status.eq.waiting,status.eq.playing')
      .order('position', { ascending: true });

    if (error) {
      console.error('Erro ao carregar fila:', error);
    } else {
      setQueue(data || []);
    }
  };

  // efeito inicial e subscription
  useEffect(() => {
    fetchQueue();

    const subscription = supabase
      .channel('karaoke_queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'karaoke_queue' },
        fetchQueue
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // efeito de reload quando prop “reload” muda
  useEffect(() => {
    fetchQueue();
  }, [reload]);

  const current = queue.find((q) => q.status === 'playing');
  const upcoming = queue.filter((q) => q.status === 'waiting');

  return (
    <Card
      elevation={3}
      sx={{
        background: 'linear-gradient(135deg, #1e1e1e, #2c2c2c)',
        borderRadius: '16px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
        color: '#ffffff',
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: '#FFD700', marginBottom: '8px' }}
        >
          🎤 Agora cantando:
        </Typography>
        {current ? (
          <Typography
            variant="subtitle1"
            sx={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ffffff' }}
          >
            <strong>{current.singer}</strong> cantando{' '}
            <em>{current.music}</em> ({current.artist})
          </Typography>
        ) : (
          <Typography color="text.secondary">
            Ninguém está cantando no momento.
          </Typography>
        )}
        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: '#FFD700', marginBottom: '8px' }}
        >
          🎶 Próximas músicas:
        </Typography>
        <List>
          {upcoming.slice(0, 3).map((item) => (
            <ListItem
              key={item.id}
              sx={{
                backgroundColor: '#2c2c2c',
                borderRadius: '12px',
                marginBottom: '8px',
                padding: '12px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              <ListItemText
                primary={`${item.singer} → ${item.music}`}
                secondary={item.artist}
                primaryTypographyProps={{
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
                secondaryTypographyProps={{
                  color: '#b0b0b0',
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}