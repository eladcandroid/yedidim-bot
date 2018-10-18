import * as geoHelper from './geoHelper'

exports.saveUserLocation = async (req, res, admin) => {
  const {
    location: {
      coords: { latitude, longitude }
    },
    authToken
  } = req.body

  console.log('@@@@ [SAVE USER LOCATION]', req.body)

  // const decodedToken = await admin.auth().verifyIdToken(authToken)

  // console.log('@@@ [DECODED TOKEN]', decodedToken)

  await geoHelper.saveLocation(
    'user_location',
    admin,
    authToken, // decodedToken.phone_number,
    [latitude, longitude]
  )

  res.status(200).send('')
}