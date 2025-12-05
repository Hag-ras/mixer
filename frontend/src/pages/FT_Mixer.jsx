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
  
  const [outputs, setOutputs] = useState({ output1: null, output2: null });
  const [activeOutput, setActiveOutput] = useState('output1');
  const [region, setRegion] = useState({ inner: true, size: 100 });

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
        const regionPayload = { x: offset, y: offset, w: sizeFraction, h: sizeFraction, inner: region.inner };
        const res = await api.post(`/mixer/process`, { weights, mode, region: regionPayload }, { responseType: 'blob', signal: abortController.current.signal });
        setOutputs(prev => ({ ...prev, [activeOutput]: URL.createObjectURL(res.data) }));
      } catch (err) { if (!api.isCancel(err)) console.error(err); } 
      finally { setLoading(false); }
    };
    const timer = setTimeout(mix, 150);
    return () => clearTimeout(timer);
  }, [weights, mode, activeOutput, region]); 

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, gap: 2 }}>
      {loading && <LinearProgress sx={{position:'absolute', top:0, left:0, right:0, zIndex:999, bgcolor: 'rgba(0,0,0,0.5)', '& .MuiLinearProgress-bar': { bgcolor: '#00e5ff' } }} />}
      
      <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
        
        {/* LEFT PANEL: INPUT GRID */}
        <Box sx={{ 
            flex: 2, 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gridTemplateRows: '1fr 1fr', 
            gap: 2, 
            overflowY: 'auto',
            minHeight: 0 // CRITICAL FIX for Grid overflow
        }}>
          {[1, 2, 3, 4].map((id) => (
            <Paper key={id} sx={{ display: 'flex', p: 1, gap: 1, minHeight: '180px', borderRadius: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Viewport id={`img${id}`} label={`Image ${id}`} imageSrc={images[`img${id}`]} onUpload={handleUpload} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Viewport id={`img${id}_ft`} label={`FT Comp.`} imageSrc={images[`img${id}_ft`]} ftOptions={true} selectedFt={ftSelections[`img${id}`]} onFtChange={(id, val) => fetchFTComponent(id.replace('_ft', ''), val)} />
                </Box>
            </Paper>
          ))}
        </Box>

        {/* RIGHT PANEL: OUTPUTS & CONTROLS */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: '300px' }}>
            
            {/* OUTPUTS */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
                <Paper sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', boxShadow: 'none', border: 'none' }}>
                    <Typography variant="subtitle2" color="text.secondary">TARGET OUTPUT</Typography>
                    <ToggleButtonGroup value={activeOutput} exclusive onChange={(_, v) => v && setActiveOutput(v)} size="small" sx={{ '& .MuiToggleButton-root': { border: '1px solid rgba(255,255,255,0.1)' } }}>
                        <ToggleButton value="output1" sx={{ '&.Mui-selected': { color: '#00e5ff' } }}>Port 1</ToggleButton>
                        <ToggleButton value="output2" sx={{ '&.Mui-selected': { color: '#00e5ff' } }}>Port 2</ToggleButton>
                    </ToggleButtonGroup>
                </Paper>

                <Box sx={{ flex: 1, display: 'flex', gap: 1, minHeight: 0 }}>
                   <Box sx={{ flex: 1 }}>
                       <Viewport 
                           label="OUTPUT 1" 
                           imageSrc={outputs.output1} 
                           style={{ border: activeOutput === 'output1' ? '2px solid #00e5ff' : '1px solid rgba(255,255,255,0.1)' }} 
                       />
                   </Box>
                   <Box sx={{ flex: 1 }}>
                       <Viewport 
                           label="OUTPUT 2" 
                           imageSrc={outputs.output2} 
                           style={{ border: activeOutput === 'output2' ? '2px solid #00e5ff' : '1px solid rgba(255,255,255,0.1)' }} 
                       />
                   </Box>
                </Box>
            </Box>

            {/* CONTROLS */}
            <Paper sx={{ p: 2, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box display="flex" justifyContent="center">
                    <ToggleButtonGroup value={mode} exclusive onChange={(e, v) => v && setMode(v)} size="small" fullWidth>
                        <ToggleButton value="mag_phase">Mag / Phase</ToggleButton>
                        <ToggleButton value="real_imag">Real / Imag</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                
                {/* SLIDERS SCROLL AREA */}
                <Box sx={{ maxHeight: '25vh', overflowY: 'auto', pr: 1 }}>
                    <MixerControls weights={weights} setWeights={setWeights} mode={mode} loadedImages={images} />
                </Box>

                {/* REGION FILTER */}
                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="caption" color="text.secondary">REGION FILTER</Typography>
                        <FormControlLabel 
                            control={<Switch size="small" checked={region.inner} onChange={(e) => setRegion({...region, inner: e.target.checked})} />} 
                            label={<Typography variant="caption" sx={{ color: region.inner ? '#00e5ff' : '#d500f9' }}>{region.inner ? "LOW PASS" : "HIGH PASS"}</Typography>} 
                        />
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="caption" color="text.secondary">SIZE</Typography>
                        <Slider 
                            size="small" 
                            value={region.size} 
                            onChange={(_, v) => setRegion({...region, size: v})} 
                            min={1} max={100} 
                            sx={{ color: region.inner ? '#00e5ff' : '#d500f9' }}
                        />
                        <Typography variant="caption" sx={{ minWidth: '35px', textAlign: 'right' }}>{region.size}%</Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>

      </Box>
    </Box>
  );
};

export default FTMixer;
