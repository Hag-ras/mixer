import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';

const BeamMap = ({ heatmapSrc, units, mapSize = 5 }) => { // Default to 5 if undefined
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each unit
    units.forEach(unit => {
      // DYNAMIC SCALING: Divide by mapSize instead of 5
      const x = (unit.x / mapSize) * canvas.width;
      const y = (unit.y / mapSize) * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI); 
      ctx.fillStyle = 'lime';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`Unit ${unit.id}`, x + 12, y + 4);
    });
  }, [units, mapSize]); // Re-draw when mapSize changes

  return (
    <Box 
      sx={{ 
        width: 500, 
        height: 500, 
        position: 'relative', 
        bgcolor: '#000', 
        border: '2px solid #555',
        margin: 'auto'
      }}
    >
      {/* Layer 1: The Heatmap */}
      {heatmapSrc && (
        <img 
          src={heatmapSrc} 
          alt="Beam Pattern" 
          style={{ 
            width: '100%', 
            height: '100%', 
            position: 'absolute', 
            top: 0, left: 0,
            opacity: 0.8 
          }} 
        />
      )}

      {/* Layer 2: The Geometry Overlay */}
      <canvas 
        ref={canvasRef}
        width={500}
        height={500}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      />
    </Box>
  );
};

export default BeamMap;
