from enum import Enum

class ComponentType(str, Enum):
    MAGNITUDE = "magnitude"
    PHASE = "phase"
    REAL = "real"
    IMAGINARY = "imaginary"

class MixerMode(str, Enum):
    MAG_PHASE = "mag_phase"
    REAL_IMAG = "real_imag"
