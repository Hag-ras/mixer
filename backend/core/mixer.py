import numpy as np
from .image_processor import ImageModel
from .modes import MixerMode

class Mixer:
    def __init__(self):
        self.images = {} 

    def add_image(self, img_id: str, image_model: ImageModel):
        self.images[img_id] = image_model
        self._unify_sizes()

    def _unify_sizes(self):
        if not self.images:
            return
        shapes = [img.data.shape for img in self.images.values()]
        min_h = min(s[0] for s in shapes)
        min_w = min(s[1] for s in shapes)
        target_shape = (min_h, min_w)
        for img in self.images.values():
            img.resize(target_shape)

    def mix(self, weights: dict, mode: MixerMode, region_mask: dict = None):
        if not self.images:
            return None

        first_img = next(iter(self.images.values()))
        rows, cols = first_img.shape
        final_ft = np.zeros((rows, cols), dtype=complex)

        if mode == MixerMode.MAG_PHASE:
            avg_mag = np.zeros((rows, cols))
            avg_phase = np.zeros((rows, cols))
            for img_id, img in self.images.items():
                avg_mag += img.magnitude * weights.get(f"{img_id}_mag", 0)
                avg_phase += img.phase * weights.get(f"{img_id}_phase", 0)
            final_ft = avg_mag * np.exp(1j * avg_phase)

        elif mode == MixerMode.REAL_IMAG:
            avg_real = np.zeros((rows, cols))
            avg_imag = np.zeros((rows, cols))
            for img_id, img in self.images.items():
                avg_real += img.real * weights.get(f"{img_id}_real", 0)
                avg_imag += img.imaginary * weights.get(f"{img_id}_imag", 0)
            final_ft = avg_real + 1j * avg_imag

        if region_mask:
            final_ft = self._apply_mask(final_ft, region_mask)

        img_back = np.fft.ifft2(np.fft.ifftshift(final_ft))
        return np.abs(img_back)

    def _apply_mask(self, ft_data, mask_info):
        rows, cols = ft_data.shape
        mask = np.zeros((rows, cols), dtype=int)
        x = int(mask_info['x'] * cols)
        y = int(mask_info['y'] * rows)
        w = int(mask_info['w'] * cols)
        h = int(mask_info['h'] * rows)
        mask[y:y+h, x:x+w] = 1
        if not mask_info['inner']:
            mask = 1 - mask
        return ft_data * mask
