from pydantic import BaseModel
from typing import Dict, Optional, List, Any

# --- Part A Models ---
class MixerRequest(BaseModel):
    weights: Dict[str, float]
    mode: str
    region: Optional[Dict[str, Any]] = None 

# --- Part B Models ---
class UnitConfig(BaseModel):
    id: int
    x: float
    y: float
    num_elements: int
    frequency: float
    
class BeamRequest(BaseModel):
    units: List[UnitConfig]
    phase_shifts: List[float]
    resolution: int = 200
    # NEW PARAMETERS
    speed: float = 3e8       # Default to Speed of Light
    map_size: float = 5.0    # Default to 5x5 meters
