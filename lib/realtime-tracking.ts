// Supabase Realtime integration for live donor tracking
// Replaces REST polling with WebSocket-based live updates

import { supabase } from './supabase';

export interface DonorLocation {
  donor_id: string;
  lat: number;
  lng: number;
  updated_at: string;
}

/**
 * Subscribe to live donor location updates
 * Returns a subscription object that can be unsubscribed
 */
export function subscribeToDonorLocation(
  donorId: string,
  onLocationUpdate: (location: DonorLocation) => void
) {
  const channel = supabase
    .channel(`donor_location:${donorId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'donor_live_location',
        filter: `donor_id=eq.${donorId}`,
      },
      (payload) => {
        onLocationUpdate(payload.new as DonorLocation);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to donor location updates');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Failed to subscribe to donor location');
      }
    });

  return channel;
}

/**
 * Unsubscribe from donor location updates
 */
export function unsubscribeFromDonorLocation(channel: any) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}

/**
 * Subscribe to all donor locations (for admin/recipient view)
 */
export function subscribeToAllDonorLocations(
  onLocationUpdate: (location: DonorLocation) => void
) {
  const channel = supabase
    .channel('all_donor_locations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'donor_live_location',
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onLocationUpdate(payload.new as DonorLocation);
        } else if (payload.eventType === 'DELETE') {
          // Donor stopped tracking
          onLocationUpdate({ ...payload.old as DonorLocation, lat: null, lng: null });
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to all donor locations');
      }
    });

  return channel;
}
