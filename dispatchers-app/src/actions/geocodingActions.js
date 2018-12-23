const MAP_KEY = 'AIzaSyA-cT9Okhw7DA97YPLxlAVoFPQDe61VdwA'

export async function geocodeAddress(address, isPlusCode) {
  try {
    if (isPlusCode){

      address = encodeURIComponent(address)
    }
    let response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?key=${MAP_KEY}&address=${address}&language=iw&&components=:country=IL`
    )
    let responseJson = await response.json()
    if (responseJson.status !== 'OK') {
      return undefined
    }
    const results = responseJson.results
    if (results.length === 0) {
      return undefined
    }
    return getAddressDetailsFromGoogleResult(results[0], isPlusCode)
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export function getAddressDetailsFromGoogleResult(result, isPlusCode) {
  const addressComponents = result.address_components
  if (!isPlusCode && (!addressComponents || addressComponents.length === 0)) {
    return undefined
  }
  const location = result.geometry.location
  return {
    address: getFormattedAddress(result),
    geo: { lat: location.lat, lon: location.lng }
  }
}

function isFullAddress(apiResult) {
  return apiResult.types.indexOf('street_address') !== -1
}

function isStreet(apiResult) {
  return apiResult.types.indexOf('route') !== -1
}

function isCity(apiResult) {
  return apiResult.types.indexOf('locality') !== -1
}

function isPointOfInterest(apiResult) {
  return apiResult.types.indexOf('point_of_interest') !== -1
}

function isNeighborhood(apiResult) {
  return apiResult.types.indexOf('neighborhood') !== -1
}

function getFormattedAddress(apiResult) {
  if (
    !apiResult.types ||
    isFullAddress(apiResult) ||
    isStreet(apiResult) ||
    isCity(apiResult) ||
    isNeighborhood(apiResult)
  ) {
    return apiResult.formatted_address
  }
  if (isPointOfInterest(apiResult)) {
    return apiResult.name + ', ' + apiResult.formatted_address
  }
  return apiResult.formatted_address
}
