import React from 'react';
import { Box, Slider, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// FIX: Use motion.create()
const MotionBox = motion.create(Box);

// Animation for each slider row
const item = {
  hidden: { opacity: 0, height: 0, marginBottom: 0, x: -20 },
  show: { opacity: 1, height: 'auto', marginBottom: 12, x: 0 },
  exit: { opacity: 0, height: 0, marginBottom: 0, x: -20 }
};

const MixerControls = ({ weights, setWeights, mode, loadedImages }) => {
  const handleChange = (imgId, component, newValue) => {
    setWeights(prev => ({ ...prev, [`${imgId}_${component}`]: newValue }));
  };

  const components = mode === 'mag_phase' ? ['mag', 'phase'] : ['real', 'imag'];
  const labels = mode === 'mag_phase' ? ['Magnitude', 'Phase'] : ['Real', 'Imaginary'];

  // Check if we have any images at all
  const hasImages = [1, 2, 3, 4].some(i => loadedImages[`img${i}`]);

  return (
    <Box sx={{ p: 1 }}>
      {!hasImages && (
        <Typography variant="caption" color="gray" fontStyle="italic" align="center" display="block" sx={{ py: 2 }}>
           Upload images to enable controls
        </Typography>
      )}

      <Box display="flex" justifyContent="space-between" gap={4}>
        {/* Column 1 (Mag / Real) */}
        <Box width="48%">
          {hasImages && <Typography variant="subtitle2" color="primary" gutterBottom>{labels[0]}</Typography>}
          
          <AnimatePresence initial={false}>
            {[1, 2, 3, 4].map(i => {
              // LOGIC: Skip if image is not uploaded
              if (!loadedImages[`img${i}`]) return null;

              return (
                <MotionBox 
                    key={`col1-${i}`} 
                    variants={item} 
                    initial="hidden" animate="show" exit="exit"
                    display="flex" alignItems="center" overflow="hidden"
                >
                  <Typography variant="caption" mr={1} color="gray" minWidth={35}>Img {i}</Typography>
                  <Slider 
                    size="small" min={0} max={1} step={0.1}
                    value={weights[`img${i}_${components[0]}`] || 0}
                    onChange={(_, val) => handleChange(`img${i}`, components[0], val)}
                    sx={{ color: '#90caf9' }}
                  />
                </MotionBox>
              );
            })}
          </AnimatePresence>
        </Box>

        {/* Column 2 (Phase / Imag) */}
        <Box width="48%">
          {hasImages && <Typography variant="subtitle2" color="secondary" gutterBottom>{labels[1]}</Typography>}
          
          <AnimatePresence initial={false}>
            {[1, 2, 3, 4].map(i => {
              // LOGIC: Skip if image is not uploaded
              if (!loadedImages[`img${i}`]) return null;

              return (
                <MotionBox 
                    key={`col2-${i}`} 
                    variants={item} 
                    initial="hidden" animate="show" exit="exit"
                    display="flex" alignItems="center" overflow="hidden"
                >
                  <Typography variant="caption" mr={1} color="gray" minWidth={35}>Img {i}</Typography>
                  <Slider 
                    size="small" min={0} max={1} step={0.1}
                    value={weights[`img${i}_${components[1]}`] || 0}
                    onChange={(_, val) => handleChange(`img${i}`, components[1], val)}
                    sx={{ color: '#f48fb1' }}
                  />
                </MotionBox>
              );
            })}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default MixerControls;
