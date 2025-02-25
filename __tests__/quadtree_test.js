const Quadtree = require('../lib/quadtree');

describe('Quadtree', () => {
  let quadtree;

  beforeEach(() => {
    quadtree = new Quadtree();
  });

  describe('encode', () => {
    it('should encode with precision 1', () => {
      expect(quadtree.encode({ lng: 45, lat: 45 }, 1)).toBe('2');
      expect(quadtree.encode({ lng: -45, lat: 45 }, 1)).toBe('1');
      expect(quadtree.encode({ lng: -45, lat: -45 }, 1)).toBe('3');
      expect(quadtree.encode({ lng: 45, lat: -45 }, 1)).toBe('4');
    });

    it('should encode with precision 2', () => {
      expect(quadtree.encode({ lng: 22.5, lat: 67.5 }, 2)).toBe('21');
      expect(quadtree.encode({ lng: -22.5, lat: 22.5 }, 2)).toBe('14');
    });

    it('should encode with custom bounds', () => {
      const customQuadtree = new Quadtree(0, 0, 100, 100);
      expect(customQuadtree.encode({ lng: 25, lat: 75 }, 2)).toBe('21');
    });
  });

  describe('decode', () => {
    it('should decode an encoded string', () => {
      const decoded = quadtree.decode('21');
      expect(decoded.origin).toEqual({ lng: 45, lat: 67.5 });
      expect(decoded.error).toEqual({ lng: 45, lat: 22.5 });
    });

    it('should decode with custom bounds', () => {
      const customQuadtree = new Quadtree(0, 0, 100, 100);
      const decoded = customQuadtree.decode('21');
      expect(decoded.origin).toEqual({ lng: 25, lat: 75 });
      expect(decoded.error).toEqual({ lng: 25, lat: 25 });
    });
  });

  describe('neighbor', () => {
    it('should find the north neighbor', () => {
      expect(quadtree.neighbor('21', 1, 0)).toBe('22');
    });

    it('should find the east neighbor', () => {
      expect(quadtree.neighbor('21', 0, 1)).toBe('24');
    });

    it('should find the south neighbor', () => {
      expect(quadtree.neighbor('22', -1, 0)).toBe('21');
    });

    it('should find the west neighbor', () => {
      expect(quadtree.neighbor('24', 0, -1)).toBe('21');
    });

    it('should find the northeast neighbor', () => {
      expect(quadtree.neighbor('21', 1, 1)).toBe('24');
    });
  });

  describe('boundingBox', () => {
    it('should return the bounding box of an encoded string', () => {
      const bbox = quadtree.boundingBox('21');
      expect(bbox).toEqual({
        minLng: 0,
        minLat: 45,
        maxLng: 90,
        maxLat: 90,
      });
    });
  });

  describe('distance', () => {
    it('should calculate the approximate distance between two coordinates', () => {
      const coord1 = { lng: 0, lat: 0 };
      const coord2 = { lng: 1, lat: 1 };
      const distance = quadtree.distance(coord1, coord2);
      expect(distance).toBeCloseTo(157249, 0);
    });
  });

  describe('envelop', () => {
    it('should return the quadtree codes that cover a bounding box', () => {
      const bbox = { minLng: 0, minLat: 0, maxLng: 90, maxLat: 90 };
      const envelop = quadtree.envelop(bbox, 1);
      expect(envelop).toEqual(['2']);
    });

    it('should return the quadtree codes for a more complex bounding box', () => {
      const bbox = { minLng: -45, minLat: -45, maxLng: 45, maxLat: 45 };
      const envelop = quadtree.envelop(bbox, 1);
      expect(envelop).toEqual(['3', '4', '1', '2']);
    });
  });
});