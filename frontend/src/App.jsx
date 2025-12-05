import React, { useState } from 'react';
import { Box, Tabs, Tab, ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import FTMixer from './pages/FT_Mixer';
import BeamSimulator from './pages/Beam_Simulator';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: { default: '#0a0a0a', paper: '#1e1e1e' },
  },
  typography: { fontFamily: 'Inter, sans-serif' }
});

function App() {
  const [tab, setTab] = useState(0);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header / Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: '#333', bgcolor: '#121212', zIndex: 10 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" centered>
            <Tab label="Part A: FT Mixer" />
            <Tab label="Part B: Beamforming" />
          </Tabs>
        </Box>

        {/* Animated Content Area */}
        <Box sx={{ flexGrow: 1, bgcolor: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode='wait'>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ height: '100%', width: '100%' }}
            >
              {tab === 0 ? <FTMixer /> : <BeamSimulator />}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
      <ToastContainer position="bottom-right" theme="dark" />
    </ThemeProvider>
  );
}

export default App;
