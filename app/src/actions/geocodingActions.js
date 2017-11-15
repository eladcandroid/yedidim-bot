
const MAP_KEY = "AIzaSyA-cT9Okhw7DA97YPLxlAVoFPQDe61VdwA";

export async function geocodeAddress(address) {
  try {
    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?key=${MAP_KEY}&address=${address}&language=iw&&components=:country=IL`);
    let responseJson = await response.json();
    console.log(responseJson);
    if (responseJson.status !== 'OK'){
      return undefined;
    }
    const results = responseJson.results;
    if (results.length === 0){
      return undefined;
    }
    const addressComponents = results[0].address_components;
    if (!addressComponents || addressComponents.length === 0){
      return undefined;
    }
    const street_number = getAddressComponent(addressComponents, 'street_number');
    const street_name = getAddressComponent(addressComponents, 'route') || getAddressComponent(addressComponents, 'neighborhood');
    const city = getAddressComponent(addressComponents, 'locality');
    if (!city || !street_name){
      return undefined;
    }
    return {
      address: results[0].formatted_address,
      geo: results[0].geometry.location,
      street_number: street_number ? street_number : 0,
      street_name: street_name,
      city: city
    };
  } catch(error) {
    console.error(error);
    return undefined;
  }
}

function getAddressComponent(addressComponents, field) {
  const component = addressComponents.find(comp => comp.types.includes(field));
  return component ? component.long_name : undefined;
}