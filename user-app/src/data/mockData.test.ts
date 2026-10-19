import { describe, it, expect } from 'vitest';
import {
  movies,
  cinemas,
  showtimes,
  showtimeDates,
  combos,
  promotions,
  sampleBookings,
} from './mockData';

describe('Mock Data Integrity Test Suite', () => {
  it('should have a valid list of movies with all required properties', () => {
    expect(movies.length).toBeGreaterThan(0);
    movies.forEach((movie) => {
      expect(movie.id).toBeTruthy();
      expect(movie.title).toBeTruthy();
      expect(movie.duration).toBeGreaterThan(0);
      expect(movie.rating).toBeGreaterThan(0);
      expect(['now_showing', 'coming_soon', 'ended']).toContain(movie.status);
      expect(movie.genre.length).toBeGreaterThan(0);
    });
  });

  it('should have valid cinema locations', () => {
    expect(cinemas.length).toBeGreaterThan(0);
    cinemas.forEach((cinema) => {
      expect(cinema.id).toBeTruthy();
      expect(cinema.name).toBeTruthy();
      expect(cinema.address).toBeTruthy();
      expect(cinema.image).toBeTruthy();
    });
  });

  it('should have dynamic 7-day showtimeDates starting from today', () => {
    expect(showtimeDates).toHaveLength(7);
    const today = new Date().toISOString().split('T')[0];
    expect(showtimeDates[0]).toBe(today);
  });

  it('should have showtimes that map to valid movies and cinemas', () => {
    expect(showtimes.length).toBeGreaterThan(0);
    const movieIds = new Set(movies.map((m) => m.id));
    const cinemaIds = new Set(cinemas.map((c) => c.id));

    showtimes.forEach((st) => {
      expect(movieIds.has(st.movieId)).toBe(true);
      expect(cinemaIds.has(st.cinemaId)).toBe(true);
      expect(st.price.standard).toBeGreaterThan(0);
      expect(st.price.vip).toBeGreaterThan(st.price.standard);
      expect(st.price.couple).toBeGreaterThan(st.price.vip);
    });
  });

  it('should have valid combo food items with prices and contents', () => {
    expect(combos.length).toBeGreaterThan(0);
    combos.forEach((c) => {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.price).toBeGreaterThan(0);
      expect(c.items.length).toBeGreaterThan(0);
    });
  });

  it('should have valid active promotions with discount codes', () => {
    expect(promotions.length).toBeGreaterThan(0);
    promotions.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.code).toBeTruthy();
      expect(p.discount).toBeTruthy();
      expect(p.terms.length).toBeGreaterThan(0);
    });
  });

  it('should have sample user bookings with valid status and items', () => {
    expect(sampleBookings.length).toBeGreaterThan(0);
    sampleBookings.forEach((b) => {
      expect(b.id).toBeTruthy();
      expect(b.movieTitle).toBeTruthy();
      expect(b.totalPrice).toBeGreaterThan(0);
      expect(['confirmed', 'completed', 'cancelled', 'pending']).toContain(b.status);
    });
  });
});
