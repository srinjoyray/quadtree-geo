const Quadtree = require('../lib/quadtree');

describe('Quadtree', () => {
  let quadtree;
  let customQuadtree;

  beforeEach(() => {
    quadtree = new Quadtree();
    customQuadtree = new Quadtree(0, 0, 100, 80);
  });

  describe('encode', () => {
    it('should encode with precision 1', () => {
      expect(quadtree.encode({ lng: 45, lat: 45 }, 1)).toBe('1');
      expect(quadtree.encode({ lng: -45, lat: 45 }, 1)).toBe('2');
      expect(quadtree.encode({ lng: -45, lat: -45 }, 1)).toBe('3');
      expect(quadtree.encode({ lng: 45, lat: -45 }, 1)).toBe('4');
    });

    it('should encode with precision 2', () => { 
      expect(quadtree.encode({ lng: 22.5, lat: 67.5 }, 2)).toBe('12'); // {+-, ++}
      expect(quadtree.encode({ lng: -22.5, lat: 22.5 }, 2)).toBe('24'); // {-+, +-}
    });

    it('should encode with custom bounds', () => {
      expect(customQuadtree.encode({ lng: 25, lat: 75 }, 2)).toBe('21'); // {-(+,-), ++} => {-+, ++}
      expect(customQuadtree.encode({ lng: 24, lat: 75 }, 2)).toBe('22'); // {--, ++}
    });
  });

  describe('decode', () => {
    
    it('should decode an encoded string', () => {
      const decoded = quadtree.decode('21');
      expect(decoded.origin).toEqual({ lng: -45, lat: 67.5 });
      expect(decoded.error).toEqual({ lng: 45, lat: 22.5 });
    });

    it('should decode with custom bounds', () => {
      const decoded = customQuadtree.decode('12');
      expect(decoded.origin).toEqual({ lng: 62.5, lat: 70 });
      expect(decoded.error).toEqual({ lng: 12.5, lat: 10 });
    });

    it('should decode single quadrant', () => {
      const decoded1 = quadtree.decode('1');
      expect(decoded1.origin).toEqual({ lng: 90, lat: 45 });
      expect(decoded1.error).toEqual({ lng: 90, lat: 45 });

      const decoded2 = quadtree.decode('2');
      expect(decoded2.origin).toEqual({ lng: -90, lat: 45 });
      expect(decoded2.error).toEqual({ lng: 90, lat: 45 });

      const decoded3 = quadtree.decode('3');
      expect(decoded3.origin).toEqual({ lng: -90, lat: -45 });
      expect(decoded3.error).toEqual({ lng: 90, lat: 45 });

      const decoded4 = quadtree.decode('4');
      expect(decoded4.origin).toEqual({ lng: 90, lat: -45 });
      expect(decoded4.error).toEqual({ lng: 90, lat: 45 });
    });

    it('should decode longer string', () => {
      const decoded = quadtree.decode('1234');
      expect(decoded.origin).toEqual({ lng: 33.75, lat: 50.625 });
      expect(decoded.error).toEqual({ lng: 11.25, lat: 5.625 });
    });

    it('should decode custom bounds longer string', () => {
      const decoded = customQuadtree.decode('2143');
      expect(decoded.origin).toEqual({ lng: 40.625, lat: 62.5 });
      expect(decoded.error).toEqual({ lng: 3.125, lat: 2.5 });
    });
  });

  describe('neighbor', () => {
    it('should find the north neighbor', () => {
      expect(quadtree.neighbor('3', 0, 1)).toBe('2');
    });

    it('should find the east neighbor', () => {
      expect(quadtree.neighbor('21', 1, 0)).toBe('12');
    });

    it('should find the south neighbor', () => {
      expect(quadtree.neighbor('22', 0, -1)).toBe('23');
    });

    it('should find the west neighbor', () => {
      expect(quadtree.neighbor('24', -1, 0)).toBe('23');
    });

    it('should find the northeast neighbor', () => {
      expect(quadtree.neighbor('23', 1, 1)).toBe('21');
    });

    it('should the east neighbor not exist', () => {
      expect(quadtree.neighbor('11', 1, 0)).toBe('-1');
    });
  });

  describe('boundingBox', () => {
    it('should return the bounding box of an encoded string', () => {
      const bbox = quadtree.boundingBox('14');
      expect(bbox).toEqual({
        minLng: 90,
        minLat: 0,
        maxLng: 180,
        maxLat: 45,
      });
    });
  });

  describe('distance', () => {
    it('should calculate the approximate distance between two coordinates', () => {
      const coord1 = { lat: 0, lng: 0 };
      const coord2 = { lat: 1, lng: 1 };
      const distance = quadtree.distance(coord1, coord2);
      expect(distance).toBeCloseTo(157249, 0);
    });
  });

  describe('sortPointsByProximityToTarget', () => {
    it('should sort points by prefix and then distance', () => {
      const target = { lng: 50, lat: 40 };
      const points = [
        { lng: 51, lat: 41 }, // closest, same prefix
        { lng: 52, lat: 42 }, // further, same prefix
        { lng: 40, lat: 40 }, // different prefix, closer
        { lng: 30, lat: 40 }, // different prefix, further
      ];
      const precision = 3;

      const sortedPoints = quadtree.sortPointsByProximityToTarget(target, points, precision);

      expect(sortedPoints).toEqual([
        { lng: 51, lat: 41 },
        { lng: 52, lat: 42 },
        { lng: 40, lat: 40 },
        { lng: 30, lat: 40 },
      ]);
    });

    it('should handle empty points array', () => {
      const target = { lng: 50, lat: 40 };
      const points = [];
      const precision = 3;

      const sortedPoints = quadtree.sortPointsByProximityToTarget(target, points, precision);

      expect(sortedPoints).toEqual([]);
    });

    it('should handle blr points', () => {
      const target = { lng: 77.69147483851216, lat: 12.98173805 };
      const points = [
        { lng: 77.74794, lat: 12.95965 }, // nexus whitefield
        { lng: 77.692635, lat: 12.926941 }, // etv
        { lng: 77.68352, lat: 12.906421 }, // junnasandra
        { lng: 77.71928, lat: 12.995923 }, // hoodi
      ];
      const precision = 20;

      const sortedPoints = quadtree.sortPointsByProximityToTarget(target, points, precision);

      const sortedPoints2 = quadtree.sortPointsByQuadtreeAndDistance(target, points, precision)

      console.log(sortedPoints, sortedPoints2)

      expect(sortedPoints).toEqual([]);
    });


  });

});