const Quadtree = require('../lib/quadtree');

describe('Quadtree', () => {
  let quadtree;
  let customQuadtree;

  beforeEach(() => {
    quadtree = new Quadtree();
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
  });

  describe('decode', () => {
    
    it('should decode an encoded string', () => {
      const decoded = quadtree.decode('21');
      expect(decoded.origin).toEqual({ lng: -45, lat: 67.5 });
      expect(decoded.error).toEqual({ lng: 45, lat: 22.5 });
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
    it('should handle empty points array', () => {
      const target = { lng: 50, lat: 40, encoded: quadtree.encode({ lng: 50, lat: 40 }, 3) };
      const points = [];

      const sortedPoints = quadtree.sortPointsByProximityToTarget(target, points, 3);
      expect(sortedPoints).toEqual([]);
    });

    it('should handle blr points', () => {
      const precision = 20;
      const target = { 
        lng: 77.69147483851216, 
        lat: 12.98173805,
        encoded: quadtree.encode({ lng: 77.69147483851216, lat: 12.98173805 }, precision),
        name: "Mahadevapura"
      };
      const points = [
        { lng: 77.74794, lat: 12.95965, name: "nexus whitefield", 
          encoded: quadtree.encode({ lng: 77.74794, lat: 12.95965 }, precision) },
        { lng: 77.692635, lat: 12.926941, name: "etv",
          encoded: quadtree.encode({ lng: 77.692635, lat: 12.926941 }, precision) },
        { lng: 77.68352, lat: 12.906421, name: "junnasandra",
          encoded: quadtree.encode({ lng: 77.68352, lat: 12.906421 }, precision) },
        { lng: 77.71928, lat: 12.995923, name: "hoodi",
          encoded: quadtree.encode({ lng: 77.71928, lat: 12.995923 }, precision) },
      ];
      const pointsDeepCopy = JSON.parse(JSON.stringify(points));

      const sortedPoints = quadtree.sortPointsByProximityToTarget(target, points, 4);
      const sortedPoints2 = quadtree.sortPointsByHaversineFormula(target, points);

      expect(sortedPoints).toMatchObject([
        pointsDeepCopy[3], pointsDeepCopy[1], pointsDeepCopy[0], pointsDeepCopy[2]
      ]);
    });
  });
});