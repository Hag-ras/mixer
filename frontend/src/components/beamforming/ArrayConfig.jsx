import React from 'react';
import { Box, Typography, Slider, TextField } from '@mui/material';

const ArrayConfig = ({ units, setUnits }) => {
    // For simplicity, we only edit the first unit in this demo
    const unitIndex = 0;
    const unit = units[unitIndex];

    const handleChange = (field, value) => {
        const newUnits = [...units];
        newUnits[unitIndex] = { ...newUnits[unitIndex], [field]: value };
        setUnits(newUnits);
    };

    if (!unit) return null;

    return (
        <Box sx={{ p: 2, border: '1px solid #333', borderRadius: 2, mb: 2 }}>
            <Typography variant="h6">Array Configuration</Typography>
            
            <Typography gutterBottom>Number of Elements: {unit.num_elements}</Typography>
            <Slider 
                min={2} max={64} step={1}
                value={unit.num_elements} 
                onChange={(_, v) => handleChange('num_elements', v)}
            />

            <Typography gutterBottom>Position X (Meters)</Typography>
            <Slider 
                min={0} max={5} step={0.1}
                value={unit.x} 
                onChange={(_, v) => handleChange('x', v)}
            />

            <Typography gutterBottom>Position Y (Meters)</Typography>
            <Slider 
                min={0} max={5} step={0.1}
                value={unit.y} 
                onChange={(_, v) => handleChange('y', v)}
            />
        </Box>
    );
};

export default ArrayConfig;
