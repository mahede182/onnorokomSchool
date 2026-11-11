export function seatOccupancyPercent(cls) {
  if (!cls || !cls.totalSeats) return 0;
  return Math.round(((cls.heldSeats + cls.confirmedSeats) / cls.totalSeats) * 100);
}
