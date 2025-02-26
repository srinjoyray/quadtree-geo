# Quadtree Geographic Encoding and Decoding

A lightweight and efficient JavaScript library for geographic coordinate encoding using quadtree. This implementation provides methods for encoding/decoding coordinates, finding neighbors, calculating bounding boxes, and performing proximity-based searches.

## Features

- 🌍 **Geographic Encoding/Decoding**: Convert coordinates to quadtree strings and back
- 🎯 **Precision Control**: Adjust encoding precision based on your needs
- 🔍 **Neighbor Finding**: Calculate adjacent quadtree cells
- 📏 **Distance Calculations**: Compute distances using the Haversine formula
- 📦 **Bounding Box**: Get the geographic bounds of encoded areas
- 🔄 **Proximity Search**: Efficient point sorting based on quadtree prefixes
- ⚙️ **Customizable**: Define custom longitude and latitude bounds


## Installation

```
npm install quadtree-geo
```

## Usage

### Basic Initialization

```javascript
// Default bounds (-180, -90, 180, 90)
const quadtree = new Quadtree();

// Custom bounds
const customQuadtree = new Quadtree(-5, 50, 2, 60); // UK bounds approximately
```

### Encoding Coordinates

```javascript
const coordinate = { lng: -0.127758, lat: 51.507351 }; // London
const encoded = quadtree.encode(coordinate, 12);
console.log(encoded); // Returns something like "213121322132"
```

### Decoding Quadtree String

```javascript
const decoded = quadtree.decode("213121322132");
console.log(decoded);
// Output:
// {
//   origin: { lng: -0.127758, lat: 51.507351 },
//   error: { lng: 0.000244, lat: 0.000244 }
// }
```

### Finding Neighbors

```javascript
const encoded = "213121322132";
const east = quadtree.neighbor(encoded, 1, 0);   // East neighbor
const north = quadtree.neighbor(encoded, 0, 1);   // North neighbor
const west = quadtree.neighbor(encoded, -1, 0);   // West neighbor
const south = quadtree.neighbor(encoded, 0, -1);  // South neighbor
```

### Getting Bounding Box

```javascript
const bounds = quadtree.boundingBox("213121322132");
console.log(bounds);
// Output:
// {
//   minLng: -0.128002,
//   minLat: 51.507107,
//   maxLng: -0.127514,
//   maxLat: 51.507595
// }
```

### Distance Calculation

```javascript
const london = { lng: -0.127758, lat: 51.507351 };
const paris = { lng: 2.352222, lat: 48.856614 };
const distance = quadtree.distance(london, paris);
console.log(`Distance: ${Math.round(distance/1000)} km`);
```

### Proximity-Based Sorting

```javascript
const target = {
    lng: -0.127758,
    lat: 51.507351,
    encoded: quadtree.encode({ lng: -0.127758, lat: 51.507351 }, 12)
};

const points = [
    { lng: 2.352222, lat: 48.856614, encoded: quadtree.encode({ lng: 2.352222, lat: 48.856614 }, 12) },
    { lng: -0.127758, lat: 51.507351, encoded: quadtree.encode({ lng: -0.127758, lat: 51.507351 }, 12) },
    // ... more points
];

// Get 5 closest points
const closest = quadtree.sortPointsByProximityToTarget(target, points, 5);
```

### Simple Distance-Based Sorting

```javascript
const target = { lng: -0.127758, lat: 51.507351 };
const points = [
    { lng: 2.352222, lat: 48.856614 },
    { lng: -0.127758, lat: 51.507351 },
    // ... more points
];

const sorted = quadtree.sortPointsByHaversineFormula(target, points);
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

## Contributing

Made by .

