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
        backdropFilter: 'blur(8px)',
        background: 'linear-gradient(90deg, rgba(30,30,30,0.85) 0%, rgba(45,45,45,0.85) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          flexWrap: 'wrap', // Permite quebra de linha em telas menores
          gap: 2, // Espaçamento entre os elementos
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 2, sm: 3 }, // Maior espaçamento entre imagem e título
            flexWrap: 'wrap', // Permite quebra de linha em telas menores
          }}
        >
          <Avatar
            src="logo.png"
            alt="Logo Ravens"
            sx={{
              width: { xs: 64, sm: 80, md: 108 }, // Tamanhos responsivos
              height: { xs: 64, sm: 80, md: 108 },
              boxShadow: 3,
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: 'secondary.main',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, // Tamanhos maiores para o título
            }}
          >
            KaraLuscas
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  </HideOnScroll>
);