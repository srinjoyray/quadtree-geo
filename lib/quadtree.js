const assert = require('assert');

/**
 * Quadtree encoding and decoding for geographic coordinates (lng, lat).
 */
class Quadtree {
    /**
     * Constructs a new Quadtree instance.
     * @param {number} minLng - Minimum longitude (default: -180).
     * @param {number} minLat - Minimum latitude (default: -90).
     * @param {number} maxLng - Maximum longitude (default: 180).
     * @param {number} maxLat - Maximum latitude (default: 90).
     */
    constructor(minLng = -180, minLat = -90, maxLng = 180, maxLat = 90) {
        assert(-90 <= minLat && minLat <= maxLat && maxLat <= 90, "minLat and maxLat must be between -90 and 90");
        assert(-180 <= minLng && minLng <= maxLng && maxLng <= 180, "minLng and maxLng must be between -180 and 180");
        this.minLng = minLng;
        this.minLat = minLat;
        this.maxLng = maxLng;
        this.maxLat = maxLat;
    }

    /**
     * Encodes a coordinate to a quadtree string (lng, lat).
     * @param {object} coordinate - The coordinate to encode (e.g., {lng, lat}).
     * @param {number} precision - The desired precision of the encoding.
     * @returns {string} The quadtree encoded string.
     */
    encode(coordinate, precision) {
        let origin = { lng: (this.minLng + this.maxLng) / 2, lat: (this.minLat + this.maxLat) / 2 };
        let range = {
            lng: (this.maxLng - this.minLng) / 2,
            lat: (this.maxLat - this.minLat) / 2,
        };
        let encoded = "";

        for (let i = 0; i < precision; i++) {
            range.lng /= 2;
            range.lat /= 2;

            if (coordinate.lng >= origin.lng && coordinate.lat >= origin.lat) {
                origin.lng += range.lng;
                origin.lat += range.lat;
                encoded += "1";
            } else if (coordinate.lng <= origin.lng && coordinate.lat >= origin.lat) {
                origin.lng -= range.lng;
                origin.lat += range.lat;
                encoded += "2";
            } else if (coordinate.lng <= origin.lng && coordinate.lat <= origin.lat) {
                origin.lng -= range.lng;
                origin.lat -= range.lat;
                encoded += "3";
            } else {
                origin.lng += range.lng;
                origin.lat -= range.lat;
                encoded += "4";
            }
        }

        return encoded;
    }

    /**
     * Decodes a quadtree string to a coordinate and error range (lng, lat).
     * @param {string} encoded - The quadtree encoded string.
     * @returns {object} An object containing the origin coordinate and error range (e.g., {origin: {lng, lat}, error}).
     */
    decode(encoded) {
        let origin = { lng: (this.minLng + this.maxLng) / 2, lat: (this.minLat + this.maxLat) / 2 };
        let range = {
            lng: (this.maxLng - this.minLng) / 2,
            lat: (this.maxLat - this.minLat) / 2,
        };

        for (const quadrant of encoded) {
            range.lng /= 2;
            range.lat /= 2;

            if (quadrant === "1") {
                origin.lng += range.lng;
                origin.lat += range.lat;
            } else if (quadrant === "2") {
                origin.lng -= range.lng;
                origin.lat += range.lat;
            } else if (quadrant === "3") {
                origin.lng -= range.lng;
                origin.lat -= range.lat;
            } else if (quadrant === "4") {
                origin.lng += range.lng;
                origin.lat -= range.lat;
            }
        }

        return { origin, error: range };
    }

    /**
     * Calculates the neighbor quadtree string.
     * @param {string} encoded - The quadtree encoded string.
     * @param {number} east - The east offset (-1, 0, 1).
     * @param {number} north - The north offset (-1, 0, 1).
     * @returns {string} The neighbor quadtree encoded string.
     */
    neighbor(encoded, east, north) {
        const decoded = this.decode(encoded);
        const neighborCoordinate = {
            lng: decoded.origin.lng + decoded.error.lng * east * 2,
            lat: decoded.origin.lat + decoded.error.lat * north * 2,
        };
        if (neighborCoordinate.lng < this.minLng ||
            neighborCoordinate.lat < this.minLat ||
            neighborCoordinate.lng > this.maxLng ||
            neighborCoordinate.lat > this.maxLat) {
            return "-1";
        }
        return this.encode(neighborCoordinate, encoded.length);
    }

    /**
     * Calculates the bounding box of a quadtree encoded area.
     * @param {string} encoded - the quadtree encoded string.
     * @returns {object} object containing the min and max lng and lat.
     */
    boundingBox(encoded) {
        const decoded = this.decode(encoded);
        return {
            minLng: decoded.origin.lng - decoded.error.lng,
            minLat: decoded.origin.lat - decoded.error.lat,
            maxLng: decoded.origin.lng + decoded.error.lng,
            maxLat: decoded.origin.lat + decoded.error.lat,
        };
    }

    /**
     * Calculates the approximate distance between two coordinates in meters using haversine formula.
     * @param {object} coord1 - The first coordinate (e.g., {lng, lat}).
     * @param {object} coord2 - The second coordinate (e.g., {lng, lat}).
     * @returns {number} The approximate distance in meters.
     */
    distance(coord1, coord2) {
        const earthRadius = 6371000; // Earth radius in meters
        const lat1Rad = (coord1.lat * Math.PI) / 180;
        const lat2Rad = (coord2.lat * Math.PI) / 180;
        const deltaLatRad = ((coord2.lat - coord1.lat) * Math.PI) / 180;
        const deltaLngRad = ((coord2.lng - coord1.lng) * Math.PI) / 180;

        const a =
            Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
            Math.cos(lat1Rad) *
            Math.cos(lat2Rad) *
            Math.sin(deltaLngRad / 2) *
            Math.sin(deltaLngRad / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    }

    /**
     * Gets the length of the matching prefix between two strings.
     * @param {string} str1 - The first string.
     * @param {string} str2 - The second string.
     * @returns {number} The length of the matching prefix.
     */
    getPrefixMatchLength(str1, str2) {
        let matchLength = 0;
        const minLength = Math.min(str1.length, str2.length);
        for (let i = 0; i < minLength; i++) {
            if (str1[i] === str2[i]) {
                matchLength++;
            } else {
                break;
            }
        }
        return matchLength;
    }

    /**
     * Sorts a list of points by matching prefix of quadtree encoding and then distance to a target coordinate.
     * @param {object} target - The target coordinate (e.g., {lng, lat, encoded}).
     * @param {Array<object>} points - The list of points to sort (e.g., [{lng, lat, encoded}, ...]).
     * @param {number} k - Number of closest points required.
     * @returns {Array<object>} The k closest points to the target.
     */
    sortPointsByProximityToTarget(target, points, k) {
        if (!points.length) return [];

        // Map points to include prefixMatch, using pre-encoded values
        const encodedPoints = points.map(point => ({
            ...point,
            prefixMatch: this.getPrefixMatchLength(target.encoded, point.encoded)
        }));

        // Group points by prefix match length
        const groupedByPrefix = new Map();
        const maxPrefixLength = target.encoded.length;
        for (let i = maxPrefixLength; i >= 0; i--) {
            groupedByPrefix.set(i, encodedPoints.filter(p => p.prefixMatch === i));
        }

        // Collect candidate points starting from highest prefix match until we have enough candidates.
        const candidates = [];
        let breakAfterNextStep = false; // Flag to indicate whether to break the loop after the next iteration.

        for (let i = maxPrefixLength; i >= 0; i--) {
            const pointsAtLevel = groupedByPrefix.get(i); // Get points associated with the current prefix length.

            if (pointsAtLevel) {
                candidates.push(...pointsAtLevel); // Add points from the current level to the candidates list.
            }

            if (breakAfterNextStep) {
                // If the flag is set, it means we've already collected at least k points in the previous iteration.
                break;
            }

            // Check if we have collected at least k candidate points.
            if (candidates.length >= k) {
                // If we have at least k points, set the flag to break after the next iteration.
                // This ensures we process one more level of prefix matches after reaching k.
                breakAfterNextStep = true;
            }
        }


        // Only calculate haversine distances for the candidate points
        candidates.forEach(item => {
            item.distance = this.distance(target, item);
        });

        // Sort candidates by distance and return k closest
        candidates.sort((a, b) => a.distance - b.distance);
        return candidates.slice(0, k);
    }

    /**
     * Sorts a list of points by quadtree encoding and then distance to a target coordinate.
     * @param {object} target - The target coordinate (e.g., {lng, lat}).
     * @param {Array<object>} points - The list of points to sort (e.g., [{lng, lat}, ...]).
     * @returns {Array<object>} The sorted list of points.
     */
    sortPointsByHaversineFormula(target, points) {
        points.sort((a, b) => {
            return this.distance(target, a) - this.distance(target, b);
        });

        return points;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = Quadtree;
} else {
    if (typeof define === "function" && define.amd) {
        define([], function () {
            return Quadtree;
        });
    } else {
        window.Quadtree = Quadtree;
    }
}