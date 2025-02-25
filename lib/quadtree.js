/**
 * Quadtree encoding and decoding for geographic coordinates.
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
        this.minLng = minLng;
        this.minLat = minLat;
        this.maxLng = maxLng;
        this.maxLat = maxLat;
    }

    /**
     * Encodes a coordinate to a quadtree string.
     * @param {object} coordinate - The coordinate to encode (e.g., {lng, lat}).
     * @param {number} precision - The desired precision of the encoding.
     * @returns {string} The quadtree encoded string.
     */
    encode(coordinate, precision) {
        let origin = { lng: this.minLng, lat: this.minLat };
        let range = {
            lng: this.maxLng - this.minLng,
            lat: this.maxLat - this.minLat,
        };
        let encoded = "";

        for (let i = 0; i < precision; i++) {
            range.lng /= 2;
            range.lat /= 2;

            if (coordinate.lng < origin.lng && coordinate.lat >= origin.lat) {
                origin.lng -= range.lng;
                origin.lat += range.lat;
                encoded += "0";
            } else if (coordinate.lng >= origin.lng && coordinate.lat >= origin.lat) {
                origin.lng += range.lng;
                origin.lat += range.lat;
                encoded += "1";
            } else if (coordinate.lng < origin.lng && coordinate.lat < origin.lat) {
                origin.lng -= range.lng;
                origin.lat -= range.lat;
                encoded += "2";
            } else {
                origin.lng += range.lng;
                origin.lat -= range.lat;
                encoded += "3";
            }
        }

        return encoded;
    }

    /**
     * Decodes a quadtree string to a coordinate and error range.
     * @param {string} encoded - The quadtree encoded string.
     * @returns {object} An object containing the origin coordinate and error range (e.g., {origin, error}).
     */
    decode(encoded) {
        let origin = { lng: this.minLng, lat: this.minLat };
        let error = {
            lng: this.maxLng - this.minLng,
            lat: this.maxLat - this.minLat,
        };

        for (const quadrant of encoded) {
            error.lng /= 2;
            error.lat /= 2;

            if (quadrant === "0") {
                origin.lng -= error.lng;
                origin.lat += error.lat;
            } else if (quadrant === "1") {
                origin.lng += error.lng;
                origin.lat += error.lat;
            } else if (quadrant === "2") {
                origin.lng -= error.lng;
                origin.lat -= error.lat;
            } else {
                origin.lng += error.lng;
                origin.lat -= error.lat;
            }
        }

        return { origin, error };
    }

    /**
     * Calculates the neighbor quadtree string.
     * @param {string} encoded - The quadtree encoded string.
     * @param {number} north - The north offset (-1, 0, 1).
     * @param {number} east - The east offset (-1, 0, 1).
     * @returns {string} The neighbor quadtree encoded string.
     */
    neighbor(encoded, north, east) {
        const decoded = this.decode(encoded);
        const neighborCoordinate = {
            lng: decoded.origin.lng + decoded.error.lng * east * 2,
            lat: decoded.origin.lat + decoded.error.lat * north * 2,
        };
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
     * Calculates the approximate distance between two coordinates in meters.
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
     * Calculates the quadtree codes that cover a bounding box at a given precision.
     * @param {object} bbox - The bounding box (e.g., {minLng, minLat, maxLng, maxLat}).
     * @param {number} precision - The desired precision.
     * @returns {string[]} An array of quadtree codes.
     */
    envelop(bbox, precision) {
        const end = this.encode({ lng: bbox.maxLng, lat: bbox.maxLat }, precision);
        let rowStart = this.encode({ lng: bbox.minLng, lat: bbox.minLat }, precision);
        let rowEnd = this.encode({ lng: bbox.maxLng, lat: bbox.minLat }, precision);
        let current = rowStart;
        const quadtrees = [];

        while (true) {
            while (current !== rowEnd) {
                quadtrees.push(current);
                current = this.neighbor(current, 0, 1);
            }

            if (current === end) break;

            quadtrees.push(rowEnd);
            rowEnd = this.neighbor(rowEnd, 1, 0);
            rowStart = this.neighbor(rowStart, 1, 0);
            current = rowStart;
        }

        quadtrees.push(end);
        return quadtrees;
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