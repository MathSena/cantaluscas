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
  Stack
} from '@mui/material';

export default function AdminPanel() {
  const [queue, setQueue] = useState([]);

  // função de busca isolada
  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('karaoke_queue')
      .select('*')
      .not('status', 'eq', 'done')
      .order('position', { ascending: true });
    if (error) {
      console.error('Erro ao carregar fila:', error);
    } else {
      setQueue(data || []);
    }
  };

  // efeito inicial
  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('karaoke_queue')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao deletar:', error);
    else fetchQueue();
  };

  const handlePlayNow = async (id) => {
    // marca a atual como done
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

    // marca nova como tocando agora
    await supabase
      .from('karaoke_queue')
      .update({ is_playing: true, status: 'playing', position: 0 })
      .eq('id', id);

    fetchQueue();
  };

  return (
    <Card elevation={3} sx={{ backgroundColor: 'background.paper' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" color="secondary">
          🎛 Painel Administrativo
        </Typography>
        <List>
          {queue.length === 0 && (
            <Typography color="text.secondary">Nenhuma música na fila.</Typography>
          )}
          {queue.map((item) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={`${item.singer} → ${item.music}`}
                secondary={
                  item.artist +
                  (item.status === 'playing' ? ' 🎤 Tocando Agora' : '')
                }
              />
              <Stack direction="row" spacing={1}>
                {item.status === 'waiting' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handlePlayNow(item.id)}
                  >
                    ▶️ Tocar Agora
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDelete(item.id)}
                >
                  Excluir
                </Button>
              </Stack>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
