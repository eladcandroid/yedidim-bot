// import { Amplitude, Constants } from 'expo'
// Disabled Amplitude due to issues with Android
export const initAnalyticsTracking = () => {
  // Amplitude.initialize(Constants.manifest.extra.AmplitudeAPI)
}

export const trackUserLogin = userId => {} // Amplitude.setUserId(userId)

export const trackEvent = (eventName, properties) => {}
// Amplitude.logEventWithProperties(eventName, properties)
