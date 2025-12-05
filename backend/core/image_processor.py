import numpy as np
from PIL import Image
import io

class ImageModel:
    def __init__(self, file_bytes: bytes, filename: str):
        self.filename = filename
        image = Image.open(io.BytesIO(file_bytes)).convert('L')
        self.original_shape = image.size
        self.data = np.array(image)
        self._fft = np.fft.fftshift(np.fft.fft2(self.data))

    @property
    def shape(self):
        return self.data.shape

    @property
    def magnitude(self):
        return np.abs(self._fft)

    @property
    def phase(self):
        return np.angle(self._fft)

    @property
    def real(self):
        return np.real(self._fft)

    @property
    def imaginary(self):
        return np.imag(self._fft)
    
    def resize(self, new_shape: tuple):
        if self.data.shape == new_shape:
            return
        image_pil = Image.fromarray(self.data)
        resized_pil = image_pil.resize((new_shape[1], new_shape[0]))
        self.data = np.array(resized_pil)
        self._fft = np.fft.fftshift(np.fft.fft2(self.data))
