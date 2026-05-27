import React from 'react';
import { Box } from '@mui/material';
import Header from './components/Header';
import Calculator from './components/Calculator';

function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d154b 0%, #1a237e 50%, #283593 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, md: 4 },
        }}
      >
        <Calculator />
      </Box>
    </Box>
  );
}

export default App;
