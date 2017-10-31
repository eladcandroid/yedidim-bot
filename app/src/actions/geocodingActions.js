
const MAP_KEY = "AIzaSyA-cT9Okhw7DA97YPLxlAVoFPQDe61VdwA";

export async function geocodeAddress(address) {
  try {
    let response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?key=${MAP_KEY}&address=${address}&language=iw&country=IL`);
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
    //TODO map components by the name
    return {
      address: results[0].formatted_address,
      geo: results[0].geometry.location,
      street_number: addressComponents[0].long_name,
      street_name: addressComponents[1].long_name,
      city: addressComponents[2].long_name
    };
  } catch(error) {
    console.error(error);
    return undefined;
  }
}