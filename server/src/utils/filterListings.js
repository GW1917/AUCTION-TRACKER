function filterListings(listings, filters) {
  return listings.filter((l) => {
    if (filters.yearFrom && l.year < parseInt(filters.yearFrom)) return false;
    if (filters.yearTo && l.year > parseInt(filters.yearTo)) return false;
    if (filters.make && !l.make.toLowerCase().includes(filters.make.toLowerCase())) return false;
    if (filters.model && !l.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
    if (filters.trim && l.trim && !l.trim.toLowerCase().includes(filters.trim.toLowerCase())) return false;
    if (filters.maxMileage && l.mileage > parseInt(filters.maxMileage)) return false;
    if (filters.minStarRating && l.starRating < parseInt(filters.minStarRating)) return false;
    if (
      filters.radius &&
      filters.radius !== 'nationwide' &&
      l.distance > parseInt(filters.radius)
    )
      return false;
    if (filters.colors && filters.colors.length > 0) {
      const match = filters.colors.some((c) =>
        l.color.toLowerCase().includes(c.toLowerCase())
      );
      if (!match) return false;
    }
    return true;
  });
}

module.exports = { filterListings };
