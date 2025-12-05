from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from core.image_processor import ImageModel
from core.mixer import Mixer
from core.modes import MixerMode
from models import MixerRequest
import io
import numpy as np
from PIL import Image

router = APIRouter(prefix="/api/mixer", tags=["Mixer"])
mixer = Mixer()

@router.post("/upload/{img_id}")
async def upload_image(img_id: str, file: UploadFile = File(...)):
    try:
        content = await file.read()
        img_model = ImageModel(content, file.filename)
        mixer.add_image(img_id, img_model)
        return {"message": "Uploaded"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/process")
async def process_mix(request: MixerRequest):
    try:
        mode_enum = MixerMode.MAG_PHASE if request.mode == "mag_phase" else MixerMode.REAL_IMAG
        result = mixer.mix(request.weights, mode_enum, request.region)
        if result is None: return {"error": "No data"}

        normalized = (result - np.min(result)) / (np.max(result) - np.min(result) + 1e-5)
        img_uint8 = (normalized * 255).astype(np.uint8)
        buf = io.BytesIO()
        Image.fromarray(img_uint8).save(buf, format="PNG")
        return Response(content=buf.getvalue(), media_type="image/png")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/component/{img_id}/{comp_type}")
async def get_component(img_id: str, comp_type: str):
    if img_id not in mixer.images: raise HTTPException(404)
    img = mixer.images[img_id]
    
    if comp_type == "magnitude": data = np.log1p(img.magnitude)
    elif comp_type == "phase": data = img.phase
    elif comp_type == "real": data = np.log1p(np.abs(img.real))
    elif comp_type == "imaginary": data = np.log1p(np.abs(img.imaginary))
    else: data = img.data

    normalized = (data - np.min(data)) / (np.max(data) - np.min(data) + 1e-5)
    img_uint8 = (normalized * 255).astype(np.uint8)
    buf = io.BytesIO()
    Image.fromarray(img_uint8).save(buf, format="PNG")
    return Response(content=buf.getvalue(), media_type="image/png")
