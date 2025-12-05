import React, { useState, useRef } from 'react';
import { Box, Typography, Select, MenuItem, Paper } from '@mui/material';
import { motion } from 'framer-motion';

// Create Motion Component
const MotionPaper = motion.create(Paper);

const Viewport = ({ 
  id, label, imageSrc, onUpload, ftOptions = false, onFtChange, selectedFt, style 
}) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Mouse Drag for Brightness/Contrast
  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent default drag behavior
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setBrightness((prev) => Math.min(200, Math.max(0, prev - dy * 0.5)));
    setContrast((prev) => Math.min(200, Math.max(0, prev + dx * 0.5)));
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  // Upload Logic
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0] && onUpload) {
      onUpload(id, e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    if (onUpload) {
      document.getElementById(`file-${id}`).click();
    }
  };

  return (
    <MotionPaper 
      elevation={3}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.005, borderColor: '#90caf9', boxShadow: "0px 0px 15px rgba(144, 202, 249, 0.2)" }}
      
      sx={{ 
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        bgcolor: '#181818', overflow: 'hidden', border: '1px solid #333',
        transition: 'box-shadow 0.2s',
        ...style // Allow custom styles passed from parent
      }}
    >
      {/* Header */}
      <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#252525', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <Typography variant="caption" fontWeight="bold" color="#ccc">{label}</Typography>
        {ftOptions && (
          <Select 
            value={selectedFt || "magnitude"} 
            onChange={(e) => onFtChange(id, e.target.value)}
            variant="standard" disableUnderline
            sx={{ fontSize: '0.7rem', color: '#90caf9', '.MuiSelect-icon': { color: '#90caf9' } }}
          >
            <MenuItem value="magnitude">Magnitude</MenuItem>
            <MenuItem value="phase">Phase</MenuItem>
            <MenuItem value="real">Real</MenuItem>
            <MenuItem value="imaginary">Imaginary</MenuItem>
          </Select>
        )}
      </Box>

      {/* Image Area */}
      <Box 
        sx={{ flexGrow: 1, position: 'relative', cursor: isDragging ? 'grabbing' : 'grab', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onDoubleClick={triggerUpload}
      >
        {imageSrc ? (
          <motion.img 
            key={imageSrc}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            src={imageSrc} alt="View" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: `brightness(${brightness}%) contrast(${contrast}%)`, userSelect: 'none', pointerEvents: 'none' }} 
          />
        ) : (
          <motion.div whileHover={{ scale: onUpload ? 1.1 : 1 }} whileTap={{ scale: 0.9 }}>
             <Box textAlign="center" color="#555">
                {onUpload ? (
                  <>
                    <Typography variant="h4" sx={{opacity:0.3}}>+</Typography>
                    <Typography variant="caption">Double-click to Upload</Typography>
                  </>
                ) : (
                   <Typography variant="caption" sx={{opacity:0.5}}>Empty Output</Typography>
                )}
             </Box>
          </motion.div>
        )}
        <input type="file" id={`file-${id}`} hidden accept="image/*" onChange={handleFileChange} />
      </Box>
    </MotionPaper>
  );
};

export default Viewport;
