# Quadtree Geographic Encoding and Decoding

This library provides a JavaScript implementation of quadtree encoding and decoding for geographic coordinates (longitude and latitude). It allows you to encode coordinates into quadtree strings and decode quadtree strings back into coordinates with error ranges. Additionally, it offers functionalities to find neighboring quadtree cells, calculate bounding boxes, compute distances, and sort points based on proximity.

## Features

-   **Coordinate Encoding and Decoding:** Convert geographic coordinates to quadtree strings and vice versa.
-   **Neighbor Calculation:** Find neighboring quadtree cells.
-   **Bounding Box Calculation:** Determine the bounding box of a quadtree encoded area.
-   **Distance Calculation:** Compute the approximate distance between two coordinates using the Haversine formula.
-   **Point Sorting:** Sort points by quadtree prefix match and distance for efficient proximity searches.
-   **Customizable Bounds:** Define custom longitude and latitude bounds.

## Installation

You can use this library in Node.js or in the browser.

### Node.js
