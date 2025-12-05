import React, { useState, useEffect, useRef } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, LinearProgress, Paper, Typography, Switch, FormControlLabel, Slider } from '@mui/material';
import Viewport from '../components/common/Viewport';
import MixerControls from '../components/mixer/MixerControls';
import api from '../services/api';
import { toast } from 'react-toastify';

const FTMixer = () => {
  const [images, setImages] = useState({});
  const [weights, setWeights] = useState({});
  const [mode, setMode] = useState('mag_phase');
  
  // Output States
  const [outputs, setOutputs] = useState({ output1: null, output2: null });
  const [activeOutput, setActiveOutput] = useState('output1');

  // Region Filter State
  const [region, setRegion] = useState({
      inner: true, // True = Low Pass, False = High Pass
      size: 100    // 100% means Full Image (No filter)
  });

  const [loading, setLoading] = useState(false);
  const abortController = useRef(null);
  
  const [ftSelections, setFtSelections] = useState({
    img1: 'magnitude', img2: 'magnitude', img3: 'magnitude', img4: 'magnitude'
  });

  const handleUpload = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/mixer/upload/${id}`, formData);
      const reader = new FileReader();
      reader.onload = (e) => setImages(prev => ({ ...prev, [id]: e.target.result }));
      reader.readAsDataURL(file);
      fetchFTComponent(id, ftSelections[id]);
    } catch (err) { toast.error("Upload failed"); }
  };

  const fetchFTComponent = async (id, type) => {
    try {
      const res = await api.get(`/mixer/component/${id}/${type}`, { responseType: 'blob' });
      setImages(prev => ({ ...prev, [`${id}_ft`]: URL.createObjectURL(res.data) }));
      setFtSelections(prev => ({ ...prev, [id]: type }));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    const mix = async () => {
      if (Object.keys(weights).length === 0) return;
      setLoading(true);
      try {
        const sizeFraction = region.size / 100;
        const offset = (1 - sizeFraction) / 2;
        
        const regionPayload = {
            x: offset, y: offset, 
            w: sizeFraction, h: sizeFraction, 
            inner: region.inner
        };

        const res = await api.post(`/mixer/process`, { 
            weights, 
            mode, 
            region: regionPayload 
        }, { 
            responseType: 'blob', 
            signal: abortController.current.signal 
        });
        
        const url = URL.createObjectURL(res.data);
        setOutputs(prev => ({ ...prev, [activeOutput]: url }));
        
      } catch (err) { if (!api.isCancel(err)) console.error(err); } 
      finally { setLoading(false); }
    };

    const timer = setTimeout(mix, 150);
    return () => clearTimeout(timer);
  }, [weights, mode, activeOutput, region]); 

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, gap: 2 }}>
      {loading && <LinearProgress sx={{position:'absolute', top:0, left:0, right:0, zIndex:999}} />}
      
      <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
        
        {/* LEFT: INPUTS */}
        <Box sx={{ flex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 2, overflowY: 'auto' }}>
          {[1, 2, 3, 4].map((id) => (
            <Paper key={id} sx={{ display: 'flex', p: 1, gap: 1, bgcolor: '#1e1e1e', minHeight: '200px' }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Viewport id={`img${id}`} label={`Image ${id}`} imageSrc={images[`img${id}`]} onUpload={handleUpload} />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Viewport 
                        id={`img${id}_ft`} label={`FT Comp.`} imageSrc={images[`img${id}_ft`]} 
                        ftOptions={true} selectedFt={ftSelections[`img${id}`]}
                        onFtChange={(id, val) => fetchFTComponent(id.replace('_ft', ''), val)}
                        onUpload={() => {}}
                    />
                </Box>
            </Paper>
          ))}
        </Box>

        {/* RIGHT: OUTPUTS & CONTROLS */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* Outputs */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Paper sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#222' }}>
                    <Typography variant="subtitle2">Target Output:</Typography>
                    <ToggleButtonGroup value={activeOutput} exclusive onChange={(_, v) => v && setActiveOutput(v)} size="small" color="primary">
                        <ToggleButton value="output1">Port 1</ToggleButton>
                        <ToggleButton value="output2">Port 2</ToggleButton>
                    </ToggleButtonGroup>
                </Paper>

                <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                   <Box sx={{ flex: 1 }}><Viewport label="Output 1" imageSrc={outputs.output1} style={{ border: activeOutput === 'output1' ? '2px solid #90caf9' : '1px solid #333' }} /></Box>
                   <Box sx={{ flex: 1 }}><Viewport label="Output 2" imageSrc={outputs.output2} style={{ border: activeOutput === 'output2' ? '2px solid #90caf9' : '1px solid #333' }} /></Box>
                </Box>
            </Box>

            {/* Controls */}
            <Paper sx={{ p: 2, bgcolor: '#1e1e1e', flexShrink: 0 }}>
                <Box mb={2} display="flex" justifyContent="center">
                    <ToggleButtonGroup value={mode} exclusive onChange={(e, v) => v && setMode(v)} size="small">
                        <ToggleButton value="mag_phase">Mag / Phase</ToggleButton>
                        <ToggleButton value="real_imag">Real / Imag</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                
                {/* SLIDERS */}
                <Box sx={{ maxHeight: '20vh', overflowY: 'auto', pr: 1, mb: 2 }}>
                    <MixerControls 
                        weights={weights} 
                        setWeights={setWeights} 
                        mode={mode}
                        loadedImages={images} // <--- PASSING THE PROP
                    />
                </Box>

                {/* REGION FILTER */}
                <Box sx={{ borderTop: '1px solid #333', pt: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="gray">Region Filter</Typography>
                        <FormControlLabel
                            control={<Switch size="small" checked={region.inner} onChange={(e) => setRegion({...region, inner: e.target.checked})} />}
                            label={<Typography variant="caption">{region.inner ? "Inner (Low Freq)" : "Outer (High Freq)"}</Typography>}
                        />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption">Size:</Typography>
                        <Slider 
                            size="small"
                            value={region.size} 
                            onChange={(_, v) => setRegion({...region, size: v})} 
                            min={1} max={100} 
                        />
                    </Box>
                </Box>
            </Paper>
        </Box>

      </Box>
    </Box>
  );
};

export default FTMixer;
