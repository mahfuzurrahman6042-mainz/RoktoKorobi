---
description: Free geolocation and tracking service options for RoktoKorobi blood donation PWA
---

# Geolocation Services for RoktoKorobi

## Current Implementation
- Browser GPS (free, always works)
- OpenStreetMap tiles (free)
- OSRM public routing server (free but unreliable)
- Supabase for location storage

## Production-Ready Upgrades (All Free)

### 1. Routing (Critical for Donor Navigation)

**Option A: Self-host OSRM** (Recommended for Bangladesh)
- Docker container with Bangladesh map data
- Runs on existing server
- 100% reliable, no rate limits
- Cost: $0

**Option B: Mapbox Directions API**
- Free tier: 100,000 requests/month
- More accurate than OSRM in some areas
- Easy switch from OSRM
- Cost: $0 until 100K requests

### 2. Real-time Location Updates

**Current:** REST API calls every 5 seconds

**Option A: Supabase Realtime** (Recommended)
- WebSocket-based live updates
- Recipient sees donor moving in real-time without polling
- Built into existing Supabase
- Cost: $0

**Option B: Ably**
- Free tier: 3M messages/month
- More reliable than WebSockets
- Cost: $0 until 3M messages

### 3. Geocoding (Address → Coordinates)

**Option: Nominatim** (OpenStreetMap)
- Free, unlimited for your use case
- Covers all Bangladesh addresses
- Self-host option available
- Cost: $0

### 4. Push Notifications (Arrival Alerts)

**Option: OneSignal**
- Free tier: Unlimited push notifications
- Works with web PWA
- Instant "Donor arrived" notifications
- Cost: $0

## Implementation Priority

### Phase 1 (Now)
1. Keep browser GPS - No change needed
2. Switch to Mapbox Directions (free tier)
3. Enable Supabase Realtime

### Phase 2 (With Users)
4. Add Nominatim for address search
5. Add OneSignal for push notifications

## Total Cost
$0 for first 100K routing requests and 3M realtime messages

## Quick Commands

```bash
# Enable Supabase Realtime for donor_location table
# Run in Supabase SQL Editor:
# alter table donor_location replica identity full;

# Get Mapbox API key (free tier)
# https://account.mapbox.com/auth/signup/
# Add to .env.local: NEXT_PUBLIC_MAPBOX_TOKEN=your_token
```
