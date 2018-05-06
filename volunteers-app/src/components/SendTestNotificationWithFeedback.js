import { sendTestNotification } from 'io/notifications'
import { Alert } from 'react-native'

export default async (id, role) => {
  try {
    await sendTestNotification(id, role)
    Alert.alert(
      'התראה נשלחה',
      'הבדיקה תצליח אם תקבל התראה בדיקה בשניות הקרובות',
      [{ text: 'בסדר', onPress: () => {} }],
      { cancelable: false }
    )
  } catch (error) {
    Alert.alert(
      'שגיעה',
      'אירע שגיעה, לא הצלחנו לשלוח את הבדיקה התראות אליך. נסה שוב מאוחר יותר.',
      [{ text: 'בסדר', onPress: () => {} }],
      { cancelable: false }
    )
  }
}
