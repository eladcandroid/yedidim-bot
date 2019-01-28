export const NOTIFICATION_SEARCH_RADIUS_KM = 5

export const CategoriesDisplay = async admin => {
  const snapshot = await admin
    .database()
    .ref('eventCategories')
    .once('value')

  return snapshot.val() || []
}
