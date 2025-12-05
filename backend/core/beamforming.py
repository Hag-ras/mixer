import numpy as np

class PhasedArrayUnit:
    def __init__(self, id: int, x: float, y: float, num_elements: int, freq: float):
        self.id = id
        self.x = x 
        self.y = y
        self.num_elements = num_elements
        self.frequency = freq
    
    def get_element_positions(self, wave_speed):
        """
        Calculates (x, y) for each antenna element.
        Auto-calculates spacing based on wavelength / 2 to prevent aliasing.
        """
        wavelength = wave_speed / self.frequency
        spacing = wavelength / 2  # Optimal spacing standard
        
        indices = np.arange(self.num_elements) - (self.num_elements - 1) / 2
        
        # Linear array along Y-axis
        x_pos = np.full(self.num_elements, self.x)
        y_pos = self.y + indices * spacing
        
        return x_pos, y_pos

class BeamSimulator:
    def __init__(self):
        self.units = []

    def add_unit(self, unit: PhasedArrayUnit):
        self.units.append(unit)

    def calculate_field(self, grid_size: int, phase_shifts: list, speed: float, map_size: float):
        # Create Grid based on dynamic map_size (e.g., 5m for 5G, 0.1m for Ultrasound)
        x = np.linspace(0, map_size, grid_size)
        y = np.linspace(0, map_size, grid_size)
        xx, yy = np.meshgrid(x, y)
        
        total_field = np.zeros((grid_size, grid_size), dtype=complex)

        for i, unit in enumerate(self.units):
            # Pass speed to calculate correct spacing
            ex, ey = unit.get_element_positions(speed)
            
            shift = phase_shifts[i] if i < len(phase_shifts) else 0
            
            wavelength = speed / unit.frequency
            k = 2 * np.pi / wavelength

            for el_idx in range(unit.num_elements):
                # Distance calculation
                dist = np.sqrt((xx - ex[el_idx])**2 + (yy - ey[el_idx])**2)
                
                # Steering delay
                element_phase = shift * el_idx 
                
                total_field += np.exp(1j * (k * dist + element_phase))

        return np.abs(total_field)
