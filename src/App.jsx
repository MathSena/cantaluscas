import React from 'react';
import './styles.css';
import { Header } from './components/Header';
import AddToQueueForm from './components/AddToQueueForm';
import QueueDisplay from './components/QueueDisplay';
import AdminPanel from './components/AdminPanel';

function App() {
  const isAdmin = window.location.pathname.includes('admin');

  return (
    <div className="app">
      {isAdmin ? (
        <>
          <h1 className="title">Painel Administrativo</h1>
          <AdminPanel />
        </>
      ) : (
        <>
          <Header />
          <AddToQueueForm />
          <QueueDisplay />
        </>
      )}
    </div>
  );
}

export default App;
