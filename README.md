# quadtree-geo

A lightweight and efficient JavaScript library for geographic coordinate encoding using quadtree. This implementation provides methods for encoding/decoding coordinates, finding neighbors, calculating bounding boxes, and performing proximity-based searches.

## Features


* **Geographic Encoding/Decoding:**
    * Transforms real-world coordinates into compact quadtree string codes.
    * Allows for easy conversion back from these codes to the original coordinates.
* **Customizable Range Limits:**
    * The constructor allows you to define custom longitude and latitude bounds. By setting smaller ranges, you can significantly reduce the area size, resulting in higher precision for your quadtree encoding.
    * Example: `new Quadtree(72, 8, 88, 35);` for focusing on India.
* **Precision Control:**
    * Adjust encoding precision based on your needs.
* **Neighbor Finding:**
    * Identifies adjacent quadtree cells, representing nearby geographic areas
* **Bounding Box:** 
    * Retrieves the latitude and longitude range that a quadtree code represents
* **Haversine Formula:**
    * Accurately calculates the great-circle distance between two points on a sphere, considering the Earth's curvature.
    * For more details on the Haversine formula, you can refer to this research document: [Vincenty and Haversine Formulas in Navigation](https://www.movable-type.co.uk/scripts/latlong.html)
* **Proximity-Based Sorting:**
    * Efficiently finds potential neighbor points by comparing quadtree prefixes, significantly reducing the search space.
    * Subsequently, it sorts these candidates using the precise Haversine formula to find the `k` nearest points.



## Installation

```
npm install quadtree-geo
```

## Usage

### Basic Initialization

```javascript
// Default bounds (-180, -90, 180, 90)
const quadtree = new Quadtree();

// Custom bounds for India
const indiaQuadtree = new Quadtree(68.1, 6.7, 97.4, 35.6);
```

### Encoding Coordinates

```javascript
const coordinate = { lng: 77.5946, lat: 12.9716 }; // Bangalore
const encoded = indiaQuadtree.encode(coordinate, 12);
console.log(encoded); // Returns something like "143212314321"
```

### Decoding Quadtree String

```javascript
const decoded = indiaQuadtree.decode("143212314321");
console.log(decoded);
// Output:
// {
//     origin: { lng: 77.5946, lat: 12.9716 },
//     error: { lng: 0.000244, lat: 0.000244 }
// }
```

### Finding Neighbors

```javascript
const encoded = "143212314321";
const east = indiaQuadtree.neighbor(encoded, 1, 0);   // East neighbor
const north = indiaQuadtree.neighbor(encoded, 0, 1);  // North neighbor
const west = indiaQuadtree.neighbor(encoded, -1, 0);  // West neighbor
const south = indiaQuadtree.neighbor(encoded, 0, -1); // South neighbor
```

### Getting Bounding Box

```javascript
const bounds = indiaQuadtree.boundingBox("143212314321");
console.log(bounds);
// Output:
// {
//     minLng: 77.594356,
//     minLat: 12.971356,
//     maxLng: 77.594844,
//     maxLat: 12.971844
// }
```

### Distance Calculation

```javascript
const bangalore = { lng: 77.5946, lat: 12.9716 };
const delhi = { lng: 77.1025, lat: 28.7041 };
const distance = indiaQuadtree.distance(bangalore, delhi);
console.log(`Distance: ${Math.round(distance / 1000)} km`);
```

### Proximity-Based Sorting

```javascript
const target = {
    lng: 77.5946,
    lat: 12.9716,
    encoded: indiaQuadtree.encode({ lng: 77.5946, lat: 12.9716 }, 12)
};

const points = [
    { lng: 77.1025, lat: 28.7041, encoded: indiaQuadtree.encode({ lng: 77.1025, lat: 28.7041 }, 12) }, // Delhi
    { lng: 77.5946, lat: 12.9716, encoded: indiaQuadtree.encode({ lng: 77.5946, lat: 12.9716 }, 12) }, // Bangalore
    { lng: 80.2707, lat: 13.0827, encoded: indiaQuadtree.encode({ lng: 80.2707, lat: 13.0827 }, 12) }, // Chennai
    { lng: 73.8567, lat: 18.5204, encoded: indiaQuadtree.encode({ lng: 73.8567, lat: 18.5204 }, 12) }, // Pune
    { lng: 72.8777, lat: 19.0760, encoded: indiaQuadtree.encode({ lng: 72.8777, lat: 19.0760 }, 12) }, // Mumbai
    // ... more points
];

// Get 3 closest points
const closest = indiaQuadtree.sortPointsByProximityToTarget(target, points, 3);
```

### Haversine Formula Based Sorting

```javascript
const target = { lng: 77.5946, lat: 12.9716 };
const points = [
    { lng: 77.1025, lat: 28.7041 },
    { lng: 77.5946, lat: 12.9716 },
    // ... more points
];

const sorted = indiaQuadtree.sortPointsByHaversineFormula(target, points);
```

## API Reference

### Constructor
- `new Quadtree(minLng = -180, minLat = -90, maxLng = 180, maxLat = 90)`

### Methods
- `encode(coordinate, precision)`: Encodes a coordinate to a quadtree string
- `decode(encoded)`: Decodes a quadtree string to coordinates with error range
- `neighbor(encoded, east, north)`: Finds neighboring quadtree cells
- `boundingBox(encoded)`: Calculates the bounding box of an encoded area
- `distance(coord1, coord2)`: Calculates distance between two points in meters
- `sortPointsByProximityToTarget(target, points, k)`: Sorts points by quadtree prefix match and distance
- `sortPointsByHaversineFormula(target, points)`: Sorts points by distance only

## License

MIT

## Contributor

Made with ❤️ by [Srinjoy Ray](https://github.com/srinjoyray).

