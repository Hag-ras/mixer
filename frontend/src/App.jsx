import React, { useState } from 'react';
import { Box, Tabs, Tab, ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import FTMixer from './pages/FT_Mixer';
import BeamSimulator from './pages/Beam_Simulator';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

// --- CYBERPUNK THEME CONFIGURATION ---
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { 
      main: '#00e5ff', // Neon Cyan
      contrastText: '#000'
    },
    secondary: { 
      main: '#d500f9', // Neon Purple 
    },
    background: { 
      default: '#050508', 
      paper: 'rgba(20, 20, 25, 0.6)', // Semi-transparent
    },
    text: {
        primary: '#eeeeee',
        secondary: '#9e9e9e',
    },
    action: {
        hover: 'rgba(0, 229, 255, 0.08)',
        selected: 'rgba(0, 229, 255, 0.16)',
    }
  },
  typography: { 
    fontFamily: '"Inter", "Roboto", sans-serif',
    h6: { 
        fontWeight: 600, 
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: '0.9rem'
    },
    caption: { 
        fontFamily: '"Fira Code", monospace', // Monospace for data
        fontSize: '0.7rem'
    },
    button: {
        fontFamily: '"Fira Code", monospace',
        fontWeight: 600
    }
  },
  shape: {
      borderRadius: 8
  },
  components: {
    // GLASS PANELS
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)', 
          backgroundColor: 'rgba(15, 15, 20, 0.7)', // Fallback
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }
      }
    },
    // GLOWING SLIDERS
    MuiSlider: {
      styleOverrides: {
        root: { color: '#00e5ff' },
        thumb: {
            boxShadow: '0 0 10px #00e5ff',
            '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 15px #00e5ff' }
        },
        rail: { opacity: 0.2 }
      }
    },
    // TECH TABS
    MuiTab: {
      styleOverrides: {
        root: {
            fontFamily: '"Fira Code", monospace',
            fontWeight: 600,
            transition: '0.3s',
            '&.Mui-selected': { color: '#00e5ff', textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }
        }
      }
    },
    // SWITCHES
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
            '&.Mui-checked': { color: '#00e5ff' },
            '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00e5ff' }
        }
      }
    }
  }
});

function App() {
  const [tab, setTab] = useState(0);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      {/* BACKGROUND: Subtle animated gradient effect */}
      <Box sx={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
          background: 'radial-gradient(circle at 50% -20%, #1a1a2e 0%, #000000 100%)',
          '&::after': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px', // The "Grid" Look
              opacity: 0.2
          }
      }} />

      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* HEADER */}
        <Box sx={{ 
            borderBottom: '1px solid rgba(255,255,255,0.1)', 
            bgcolor: 'rgba(5, 5, 8, 0.8)', 
            backdropFilter: 'blur(10px)',
            zIndex: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <Tabs 
            value={tab} 
            onChange={(_, v) => setTab(v)} 
            textColor="primary" 
            indicatorColor="primary" 
            centered
          >
            <Tab label="FT IMAGE MIXER" />
            <Tab label="BEAMFORMING LAB" />
          </Tabs>
        </Box>

        {/* CONTENT AREA */}
        <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode='wait'>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ height: '100%', width: '100%' }}
            >
              {tab === 0 ? <FTMixer /> : <BeamSimulator />}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
      <ToastContainer position="bottom-right" theme="dark" toastStyle={{ backgroundColor: '#1e1e24', color: '#fff' }} />
    </ThemeProvider>
  );
}

export default App;
