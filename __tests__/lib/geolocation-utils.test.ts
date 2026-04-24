import { getDistanceMeters } from '@/lib/geolocation-utils'

describe('Geolocation Utils', () => {
  describe('getDistanceMeters', () => {
    test('calculates distance between two coordinates correctly', () => {
      // Dhaka coordinates
      const lat1 = 23.8103
      const lon1 = 90.4125
      // Chittagong coordinates (roughly)
      const lat2 = 22.3569
      const lon2 = 91.7832

      const distance = getDistanceMeters(lat1, lon1, lat2, lon2)

      // Distance should be approximately 200-250km
      expect(distance).toBeGreaterThan(200000)
      expect(distance).toBeLessThan(300000)
    })

    test('returns 0 for same coordinates', () => {
      const lat = 23.8103
      const lon = 90.4125

      const distance = getDistanceMeters(lat, lon, lat, lon)
      expect(distance).toBe(0)
    })

    test('calculates small distances correctly', () => {
      // Two points in Dhaka (roughly 1km apart)
      const lat1 = 23.8103
      const lon1 = 90.4125
      const lat2 = 23.8203
      const lon2 = 90.4225

      const distance = getDistanceMeters(lat1, lon1, lat2, lon2)

      // Should be around 1.5km
      expect(distance).toBeGreaterThan(1000)
      expect(distance).toBeLessThan(2000)
    })
  })
})
