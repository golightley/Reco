  const toRad = (x) => {
    return x * Math.PI / 180;
  }

  const getDistanceBetweenPoints = (start, end, units) => {
    const earthRadius = {
      miles: 3958.8,
      km: 6371
    };
    const R = earthRadius[units || 'miles'];
    const lat1 = start.lat;
    const lon1 = start.lng;
    const lat2 = end.lat;
    const lon2 = end.lng;

    const dLat = toRad((lat2 - lat1));
    const dLon = toRad((lon2 - lon1));
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  const filterByHaversine = (recList, userLocation, filterDistance) => {
    const filterList = [];
    recList.map((rec) => {
      const placeLocation = {
        lat: rec.lat,
        lng: rec.lng
      };
      rec.distance = getDistanceBetweenPoints(
        userLocation,
        placeLocation,
        'miles'
      ).toFixed(2);
      if (rec.distance <= filterDistance) {
        filterList.push(rec);
      }
    });
    return filterList;
  }

  export {
    filterByHaversine
  }
