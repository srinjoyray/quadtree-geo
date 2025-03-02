# Quadtree Geographic Encoding and Decoding

A lightweight and efficient JavaScript library for geographic coordinate encoding using quadtree. This implementation provides methods for encoding/decoding coordinates, finding neighbors, calculating bounding boxes, and performing proximity-based searches.

## Features


* **Geographic Encoding/Decoding:**
    * Transforms real-world coordinates into compact quadtree string codes.
    * Allows for easy conversion back from these codes to the original coordinates.
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
```

### Encoding Coordinates

```javascript
const coordinate = { lng: 77.5946, lat: 12.9716 };
const encoded = quadtree.encode(coordinate, 12);
console.log(encoded); // Returns "134134143212"
```

### Decoding Quadtree String

```javascript
const decoded = quadtree.decode("134134143212");
console.log(decoded);
// Output:
// {
//   origin: { lng: 77.5634765625, lat: 12.98583984375 },
//   error: { lng: 0.0439453125, lat: 0.02197265625 }
// }
```

### Finding Neighbors

```javascript
const encoded = "134134143212";
const east = quadtree.neighbor(encoded, 1, 0);   // East neighbor
const north = quadtree.neighbor(encoded, 0, 1);  // North neighbor
const west = quadtree.neighbor(encoded, -1, 0);  // West neighbor
const south = quadtree.neighbor(encoded, 0, -1); // South neighbor
```

### Getting Bounding Box

```javascript
const bounds = quadtree.boundingBox("134134143212");
console.log(bounds);
// Output:
// {
//   minLng: 77.51953125,
//   minLat: 12.9638671875,
//   maxLng: 77.607421875,
//   maxLat: 13.0078125
// }
```

### Distance Calculation

```javascript
const bangalore = { lng: 77.5946, lat: 12.9716 };
const delhi = { lng: 77.1025, lat: 28.7041 };
const distance = quadtree.distance(bangalore, delhi);
console.log(`Distance: ${Math.round(distance / 1000)} km`); // Distance: 1750 km
```

### Proximity-Based Sorting

```javascript
const target = {
    lng: 77.5946,
    lat: 12.9716,
    encoded: quadtree.encode({ lng: 77.5946, lat: 12.9716 }, 12)
};

const points = [
    { lng: 77.1025, lat: 28.7041, encoded: quadtree.encode({ lng: 77.1025, lat: 28.7041 }, 12) }, // Delhi
    { lng: 77.5946, lat: 12.9716, encoded: quadtree.encode({ lng: 77.5946, lat: 12.9716 }, 12) }, // Bangalore
    { lng: 80.2707, lat: 13.0827, encoded: quadtree.encode({ lng: 80.2707, lat: 13.0827 }, 12) }, // Chennai
    { lng: 73.8567, lat: 18.5204, encoded: quadtree.encode({ lng: 73.8567, lat: 18.5204 }, 12) }, // Pune
    { lng: 72.8777, lat: 19.0760, encoded: quadtree.encode({ lng: 72.8777, lat: 19.0760 }, 12) }, // Mumbai
    // ... more points
];

// Get 3 closest points
const closest = quadtree.sortPointsByProximityToTarget(target, points, 3);

// Output:
// [
//   {
//     lng: 77.5946,
//     lat: 12.9716,
//     encoded: '134134143212',
//     prefixMatch: 12,
//     distance: 0
//   },
//   {
//     lng: 80.2707,
//     lat: 13.0827,
//     encoded: '134143242331',
//     prefixMatch: 4,
//     distance: 290172.0249530612
//   },
//   {
//     lng: 73.8567,
//     lat: 18.5204,
//     encoded: '134124234232',
//     prefixMatch: 4,
//     distance: 735226.9425849161
//   }
// ]
```

### Haversine Formula Based Sorting

```javascript
const target = { lng: 77.5946, lat: 12.9716 };
const points = [
    { lng: 77.1025, lat: 28.7041 },
    { lng: 77.5946, lat: 12.9716 },
    // ... more points
];

const sorted = quadtree.sortPointsByHaversineFormula(target, points);

// Output:
// [ { lng: 77.5946, lat: 12.9716 }, { lng: 77.1025, lat: 28.7041 } ]
```

## API

### `Quadtree`

* **`constructor()`**: Constructs a new Quadtree instance.
* **`encode(coordinate, precision)`**: Encodes a coordinate to a quadtree string.
    * `coordinate`: An object with `lng` and `lat` properties.
    * `precision`: The desired precision of the encoding.
    * Returns: The quadtree encoded string.
* **`decode(encoded)`**: Decodes a quadtree string to a coordinate and error range.
    * `encoded`: The quadtree encoded string.
    * Returns: An object with `origin` (coordinate) and `error` (range) properties.
* **`neighbor(encoded, east, north)`**: Calculates the neighbor quadtree string.
    * `encoded`: The quadtree encoded string.
    * `east`: The east offset (-1, 0, 1).
    * `north`: The north offset (-1, 0, 1).
    * Returns: The neighbor quadtree encoded string.
* **`boundingBox(encoded)`**: Calculates the bounding box of a quadtree encoded area.
    * `encoded`: The quadtree encoded string.
    * Returns: An object with `minLng`, `minLat`, `maxLng`, and `maxLat` properties.
* **`distance(coord1, coord2)`**: Calculates the approximate distance between two coordinates in meters using the haversine formula.
    * `coord1`: The first coordinate.
    * `coord2`: The second coordinate.
    * Returns: The approximate distance in meters.
* **`sortPointsByProximityToTarget(target, points, k)`**: Sorts points by using a combination of quadtree prefix match and distance to a target coordinate using haversine formula.
    * `target`: The target coordinate with its quadtree encoding (e.g., `{lng, lat, encoded}`).
    * `points`: The list of points to sort, each with its quadtree encoding (e.g., `[{lng, lat, encoded}, ...]`).
    * `k`: The number of closest points to return.
    * Returns: The `k` closest points to the target, sorted by quadtree prefix match and distance.
* **`sortPointsByHaversineFormula(target, points)`**: Sorts points by distance only, using the haversine formula.
    * `target`: The target coordinate (e.g., `{lng, lat}`).
    * `points`: The list of points to sort (e.g., `[{lng, lat}, ...]`).
    * Returns: The sorted list of points.

## License

MIT

## Contributor

Made with ❤️ by [Srinjoy Ray](https://github.com/srinjoyray).

