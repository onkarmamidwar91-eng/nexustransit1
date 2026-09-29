"""
SIMULATED GPS / AIS-140 DATA
-----------------------------
This module fakes what a real AIS-140 VLTD API would provide: a live
lat/lon stream per bus. It is NOT connected to any real vehicle tracking
system. Replace `get_random_point_on_route` with a real AIS-140 client
later — the rest of the codebase only depends on this function's return
shape (lat, lon), so the swap is contained to this file.
"""
import random

# Sample routes around Pune. Each is a short list of GPS waypoints
# roughly tracing the route from origin to destination.
SAMPLE_ROUTES = {
    "Pune Station -> Swargate": [
        (18.5284, 73.8746),
        (18.5267, 73.8689),
        (18.5234, 73.8612),
        (18.5204, 73.8567),
        (18.5145, 73.8520),
    ],
    "Shivajinagar -> Hadapsar": [
        (18.5308, 73.8474),
        (18.5236, 73.8567),
        (18.5089, 73.8730),
        (18.5018, 73.9260),
        (18.5089, 73.9260),
    ],
    "Kothrud -> Viman Nagar": [
        (18.5074, 73.8077),
        (18.5150, 73.8300),
        (18.5304, 73.8567),
        (18.5522, 73.9095),
        (18.5679, 73.9143),
    ],
    "Hinjewadi -> Pune Station": [
        (18.5912, 73.7389),
        (18.5679, 73.7749),
        (18.5504, 73.8100),
        (18.5350, 73.8450),
        (18.5284, 73.8746),
    ],
    "Katraj -> Aundh": [
        (18.4575, 73.8648),
        (18.4900, 73.8500),
        (18.5100, 73.8300),
        (18.5400, 73.8100),
        (18.5636, 73.8071),
    ],
}


def list_routes():
    return list(SAMPLE_ROUTES.keys())


def get_random_point_on_route(route_name: str):
    """Returns a (lat, lon) tuple simulating the bus's current position."""
    points = SAMPLE_ROUTES.get(route_name) or list(SAMPLE_ROUTES.values())[0]
    lat, lon = random.choice(points)
    # add small jitter so repeated demo runs aren't pixel-identical
    lat += random.uniform(-0.0007, 0.0007)
    lon += random.uniform(-0.0007, 0.0007)
    return round(lat, 6), round(lon, 6)
