import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  useScrollTrigger,
  Slide,
  Container,
} from '@mui/material';

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
        background: 'rgba(20,20,20,0.9)',
      }}
    >
      <Container maxWidth="md">
        <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
          <Avatar
            src="/logo.png"
            alt="Logo"
            sx={{ width: 48, height: 48, mr: 2 }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #FFD700, #FF8C00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TRINTAOKÊ DO LUCAS
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  </HideOnScroll>
);
