import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import AddToQueueForm from './components/AddToQueueForm';
import QueueDisplay from './components/QueueDisplay';
import AdminPanel from './components/AdminPanel';

function Home() {
  const [reload, setReload] = useState(false);
  const triggerReload = () => setReload(prev => !prev);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Header />
      <Box sx={{ mt: 3 }}>
        <AddToQueueForm onMusicAdded={triggerReload} />
      </Box>
      <Box sx={{ mt: 3 }}>
        <QueueDisplay reload={reload} />
      </Box>
    </Container>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Container maxWidth="md" sx={{ py: 4 }}>
          <Header />
          <Box sx={{ mt: 3 }}>
            <AdminPanel />
          </Box>
        </Container>} />
      </Routes>
    </BrowserRouter>
  );
}
