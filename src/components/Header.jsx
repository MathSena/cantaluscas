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
      sx={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(30,30,30,0.75)' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src="logo.png"
            alt="Logo Ravens"
            sx={{ width: 108, height: 108, boxShadow: 3 }}
          />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
            KaraLuscas
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ opacity: 0.75, color: 'secondary.main' }}>
          🎤 Seja bem-vindo!
        </Typography>
      </Toolbar>
    </AppBar>
  </HideOnScroll>
);