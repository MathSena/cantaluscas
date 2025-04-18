import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';

export default function QueueDisplay() {
  const [queue, setQueue] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  // Função para buscar a fila do banco de dados
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

  // Efeito para buscar a fila inicialmente e configurar a subscription
  useEffect(() => {
    fetchQueue();
  
    // Configura a subscription para ouvir mudanças na tabela "karaoke_queue"
    const channel = supabase
      .channel('karaoke_queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'karaoke_queue' },
        (payload) => {
          console.log('Evento capturado:', payload); // Verifica se o evento está sendo recebido
          fetchQueue(); // Atualiza a fila sempre que houver uma mudança
  
          // Verifica o tipo de evento e define a mensagem de notificação
          const { eventType, new: newData, old } = payload;
  
          if (eventType === 'INSERT') {
            setNotification({
              open: true,
              message: `🎵 Nova música adicionada: ${newData.singer} - "${newData.music}"`,
              type: 'success',
            });
          } else if (eventType === 'DELETE') {
            setNotification({
              open: true,
              message: `❌ Música removida: ${old.singer} - "${old.music}"`,
              type: 'warning',
            });
          }
        }
      )
      .subscribe();
  
    // Limpa a subscription ao desmontar o componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const current = queue.find((q) => q.status === 'playing');
  const upcoming = queue.filter((q) => q.status === 'waiting');

  return (
    <>
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
            {upcoming.map((item) => (
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

      {/* Notificação */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}