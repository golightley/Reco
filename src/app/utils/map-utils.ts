
  const toRad = (x) => {
    return x * Math.PI / 180;
  }

  const getDistanceBetweenPoints = async (start, end, units) => {
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
    return parseFloat(d.toFixed(2));
  }

  const filterByHaversine = async (recList, userLocation, filterDistance) => {
    const filterList = [];
    recList.map(async (rec) => {
      const placeLocation = {
        lat: rec.lat,
        lng: rec.lng
      };
      rec.distance = await getDistanceBetweenPoints(
        userLocation,
        placeLocation,
        'miles'
      );
      if (filterDistance === -1) { // if filterDistance is -1, push all data
        filterList.push(rec);
      } else if (rec.distance <= filterDistance) {
        filterList.push(rec);
      }
    });
    return filterList;
  };

  const getDistanceByLocation = async (recosList, userLocation) => {
    const sortedList = [];
    recosList.map(async (rec) => {
      let lat, lng;
      if (typeof rec.location !== 'undefined') {
        lat = rec.location.lat;
        lng = rec.location.lng;
      } else {
        lat = rec.data().location.lat;
        lng = rec.data().location.lng;
      }
      const placeLocation = {
        lat: lat,
        lng: lng
      };
      // console.log('user location', userLocation);
      // console.log('place location', placeLocation);
      rec.distance = await getDistanceBetweenPoints(
        userLocation,
        placeLocation,
        'miles'
      );
      sortedList.push(rec);
    });
    return sortedList;
  };

  export {
    filterByHaversine,
    getDistanceByLocation
  }

