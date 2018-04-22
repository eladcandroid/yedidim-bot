import firebase from 'firebase'

export default async function loadCategories() {
  const snapshot = await firebase
    .database()
    .ref('eventCategories')
    .once('value')

  return snapshot.val() || []
}
