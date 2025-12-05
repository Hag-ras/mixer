import React, { useState, useEffect, useRef } from 'react';
import { Box, Slider, Typography, Button, Paper, TextField, InputAdornment } from '@mui/material';
import { Grid } from '@mui/material';
import BeamMap from '../components/beamforming/BeamMap';
import axios from '../services/api';

const API_URL = "/beam"; 

const BeamSimulator = () => {
  const [config, setConfig] = useState({
    units: [{ id: 1, x: 2.5, y: 2.5, num_elements: 32, frequency: 3e9 }],
    speed: 3e8, mapSize: 5.0     
  });
  const [steering, setSteering] = useState(0);
  const [heatmap, setHeatmap] = useState(null);
  const abortController = useRef(null);

  const simulate = async () => {
    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();
    try {
      const radShift = (steering * Math.PI) / 180;
      const payload = {
        units: config.units, phase_shifts: [radShift], resolution: 200, speed: config.speed, map_size: config.mapSize
      };
      const res = await axios.post(`${API_URL}/simulate`, payload, { responseType: 'blob', signal: abortController.current.signal });
      setHeatmap(URL.createObjectURL(res.data));
    } catch (err) { if (!axios.isCancel(err)) console.error(err); }
  };

  useEffect(() => { simulate(); }, [steering, config]);
  const updateConfig = (field, value) => setConfig(prev => ({ ...prev, [field]: parseFloat(value) }));
  const updateFrequency = (val) => { const newUnits = [...config.units]; newUnits[0].frequency = parseFloat(val); setConfig(prev => ({ ...prev, units: newUnits })); };

  const loadScenario = (type) => {
      if (type === '5g') setConfig({ units: [{ id: 1, x: 1.5, y: 1.5, num_elements: 16, frequency: 28e9 }, { id: 2, x: 3.5, y: 3.5, num_elements: 16, frequency: 28e9 }], speed: 3e8, mapSize: 5.0 });
      else if (type === 'ultrasound') setConfig({ units: [{ id: 1, x: 0.05, y: 0.02, num_elements: 32, frequency: 3.5e6 }], speed: 1540, mapSize: 0.1 });
  };

  return (
    <Box p={3} sx={{ height: '100%', overflowY: 'auto' }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}> 
            <Box display="flex" justifyContent="center" position="relative">
                <BeamMap heatmapSrc={heatmap} units={config.units} mapSize={config.mapSize} />
                <Typography variant="caption" sx={{ position: 'absolute', bottom: 5, right: 5, color: 'white', bgcolor: 'rgba(0,0,0,0.7)', px: 1, borderRadius: 1 }}>
                    View: {config.mapSize} m
                </Typography>
            </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                    <Typography variant="h6" color="primary">BEAM STEERING</Typography>
                    <Typography variant="caption" gutterBottom color="text.secondary">Phase: {steering}°</Typography>
                    <Slider min={-180} max={180} step={1} value={steering} onChange={(_, val) => setSteering(val)} />
                </Box>
                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>SYSTEM CONFIG</Typography>
                    <Typography variant="caption" color="text.secondary">ZOOM (MAP SIZE)</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="caption">IN</Typography>
                        <Slider min={0.05} max={10} step={0.05} value={config.mapSize} onChange={(_, v) => updateConfig('mapSize', v)} sx={{ flex: 1 }} />
                        <Typography variant="caption">OUT</Typography>
                    </Box>
                    <Box mt={2}>
                        <Typography variant="caption" color="text.secondary">FREQUENCY (Hz)</Typography>
                        <TextField fullWidth size="small" type="number" variant="outlined" value={config.units[0].frequency} onChange={(e) => updateFrequency(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">Hz</InputAdornment> }} />
                    </Box>
                </Box>
                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>PRESETS</Typography>
                    <Box display="flex" gap={1}>
                        <Button variant="outlined" onClick={() => loadScenario('5g')} fullWidth>5G Radio</Button>
                        <Button variant="outlined" onClick={() => loadScenario('ultrasound')} fullWidth>Ultrasound</Button>
                    </Box>
                </Box>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
export default BeamSimulator;
