import React from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, useScrollTrigger, Slide } from '@mui/material';

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export const Header = () => (
  <HideOnScroll>
    <AppBar
      position="sticky"
      color="transparent"
      elevation={4}
      sx={{
        backdropFilter: 'blur(10px)',
        maxWidth: '999px', 
        background: 'linear-gradient(90deg, rgba(20,20,20,0.9) 0%, rgba(40,40,40,0.9) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: { xs: '8px 16px', sm: '12px 24px' }, // Padding responsivo
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          maxWidth: '999px', 
          alignItems: 'center',
          flexWrap: 'wrap', // Permite quebra de linha em telas menores
          gap: 2, // Espaçamento entre os elementos
        }}
      >
        {/* Logo e Título */}
        <Box
          sx={{
            display: 'flex',
            maxWidth: '999px', 
            alignItems: 'center',
            gap: { xs: 2, sm: 3 }, // Espaçamento responsivo
            flexWrap: 'wrap', // Permite quebra de linha em telas menores
          }}
        >
          <Avatar
            src="/logo.png" // Caminho corrigido para a imagem
            alt="Logo KaraLuscas"
            sx={{
              width: { xs: 56, sm: 72, md: 96 }, // Tamanhos responsivos
              height: { xs: 56, sm: 72, md: 96 },
              boxShadow: 3,
              border: '2px solid rgba(255, 255, 255, 0.2)', // Borda sutil
            }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' }, // Tamanhos responsivos
                background: 'linear-gradient(90deg, #FFD700, #FF8C00)', // Gradiente dourado/laranja
                WebkitBackgroundClip: 'text', // Faz o gradiente aplicar apenas ao texto
                WebkitTextFillColor: 'transparent', // Faz o fundo do texto transparente
                textShadow: '2px 2px 6px rgba(0, 0, 0, 0.5)', // Sombra no texto
                letterSpacing: '2px', // Espaçamento entre letras
                textTransform: 'uppercase', // Deixa o texto em maiúsculas
              }}
            >
              TRINTAOKÊ DO LUCAS
            </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  </HideOnScroll>
);