from fastapi import APIRouter
from fastapi.responses import Response
from models import BeamRequest
from core.beamforming import BeamSimulator, PhasedArrayUnit
import numpy as np
import io
from PIL import Image

router = APIRouter(prefix="/api/beam", tags=["Beamforming"])

@router.post("/simulate")
async def simulate_beam(req: BeamRequest):
    simulator = BeamSimulator()
    for u in req.units:
        unit = PhasedArrayUnit(u.id, u.x, u.y, u.num_elements, u.frequency)
        simulator.add_unit(unit)
    
    # Pass new parameters: speed and map_size
    field = simulator.calculate_field(req.resolution, req.phase_shifts, req.speed, req.map_size)
    
    field_norm = field / (np.max(field) + 1e-9)
    img_uint8 = (field_norm * 255).astype(np.uint8)
    
    buf = io.BytesIO()
    Image.fromarray(img_uint8).save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")
