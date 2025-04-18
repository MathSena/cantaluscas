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
    <Card
      elevation={3}
      sx={{
        backgroundColor: '#1e1e1e', // Fundo escuro
        borderRadius: '16px',
        padding: '16px',
        color: '#ffffff', // Texto claro
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          fontWeight="bold"
          color="#ffffff" // Texto claro
          sx={{ marginBottom: '16px' }}
        >
          Painel Administrativo
        </Typography>
        <List>
          {queue.length === 0 && (
            <Typography color="text.secondary">
              Nenhuma música na fila.
            </Typography>
          )}
          {queue.map((item) => (
            <ListItem
              key={item.id}
              sx={{
                backgroundColor: '#2c2c2c', // Fundo escuro para itens
                borderRadius: '12px',
                marginBottom: '8px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)', // Sombra mais forte
                padding: '16px',
                color: '#ffffff', // Texto claro
              }}
            >
              <ListItemText
                primary={`${item.singer} → ${item.music}`}
                secondary={
                  item.artist +
                  (item.status === 'playing' ? ' 🎤 Tocando Agora' : '')
                }
                primaryTypographyProps={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#ffffff', // Texto claro
                }}
                secondaryTypographyProps={{
                  color: '#b0b0b0', // Texto secundário mais claro
                  fontSize: '14px',
                }}
              />
              <Stack direction="row" spacing={1}>
                {item.status === 'waiting' && (
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#007AFF',
                      color: '#fff',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '14px',
                      padding: '8px 16px',
                      '&:hover': {
                        backgroundColor: '#005BB5',
                      },
                    }}
                    onClick={() => handlePlayNow(item.id)}
                  >
                    Tocar Agora
                  </Button>
                )}
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#FF3B30',
                    color: '#FF3B30',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '14px',
                    padding: '8px 16px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 59, 48, 0.1)',
                    },
                  }}
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