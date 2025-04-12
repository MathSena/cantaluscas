import React from 'react';
import '../styles.css';

export const Header = () => {
  return (
    <div className="header">
      <img 
        src="logo.png"
        alt="Ravens Logo"
        className="logo"
      />
      <h1 className="title">KaraLuscas 🎤</h1>
    </div>
  );
};
