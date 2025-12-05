import React, { useState, useEffect } from 'react';
import { Box, Slider, Typography, Switch, FormControlLabel } from '@mui/material';

const RegionSelector = ({ region, setRegion }) => {
    // region structure: { x: 0.4, y: 0.4, w: 0.2, h: 0.2, inner: true }
    // We simplify it to a centralized square size for UI simplicity, 
    // but the backend supports full rectangles.

    const [size, setSize] = useState(50); // Percentage size
    const [isInner, setIsInner] = useState(true);

    useEffect(() => {
        // Convert slider 0-100 to normalized coordinates centered
        // A size of 10% means starting at 45% and width 10%
        const normalizedSize = size / 100;
        const start = (1 - normalizedSize) / 2;
        
        setRegion({
            x: start,
            y: start,
            w: normalizedSize,
            h: normalizedSize,
            inner: isInner
        });
    }, [size, isInner, setRegion]);

    return (
        <Box sx={{ p: 2, border: '1px solid #333', borderRadius: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Region Filter (Low/High Pass)</Typography>
            
            <FormControlLabel
                control={<Switch checked={isInner} onChange={(e) => setIsInner(e.target.checked)} />}
                label={isInner ? "Keep Inner (Low Freq)" : "Keep Outer (High Freq)"}
            />

            <Typography variant="caption" display="block" mt={1}>
                Region Size: {size}%
            </Typography>
            <Slider 
                value={size} 
                onChange={(_, v) => setSize(v)} 
                min={0} max={100} 
            />
        </Box>
    );
};

export default RegionSelector;
