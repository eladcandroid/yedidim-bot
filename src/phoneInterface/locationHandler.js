import * as phonePermissionsHandler from "./phonePermissionsHandler";
import {Location} from "expo";

async function getLocationIfPermitted() {
    return new Promise(async (resolve) => {
        const hasLocationPermission = await phonePermissionsHandler.getLocationPermission();
        if (hasLocationPermission) {
            const currentLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = currentLocation.coords
            resolve([latitude, longitude]);
        } else {
            resolve(null);
        }
    })
}

export default {getLocationIfPermitted};