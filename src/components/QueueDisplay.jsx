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
    <Card elevation={3} sx={{ backgroundColor: 'background.paper' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" color="thirdy">
          🎤 Agora cantando:
        </Typography>
        {current ? (
          <Typography variant="subtitle1">
            <strong>{current.singer}</strong> cantando{' '}
            <em>{current.music}</em> ({current.artist})
          </Typography>
        ) : (
          <Typography color="text.secondary">
            Ninguém está cantando no momento.
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight="bold" color="thirdy">
          🎶 Próximas músicas:
        </Typography>
        <List>
          {upcoming.slice(0, 3).map((item) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={`${item.singer} → ${item.music}`}
                secondary={item.artist}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
