import { sendTestNotification } from 'io/notifications'
import { Toast } from 'native-base'
import Sentry from 'sentry-expo'

const forAllUsers = (id, role) => !id || !role

export default async (id, role) => {
  try {
    await sendTestNotification(id, role)
    Toast.show({
      text: forAllUsers(id, role)
        ? 'התראות נשלחו לכל המשתמשים'
        : 'התראה נשלחה. הבדיקה תצליח אם תתקבל התראה בדיקה בשניות הקרובות',
      position: 'bottom',
      buttonText: 'בסדר',
      type: 'success',
      duration: 10000
    })
  } catch (e) {
    Sentry.captureException(e)
    Toast.show({
      text:
        'אירע שגיעה, המערכת לא הצליחה לשלוח התראה בדיקה. נסה שוב מאוחר יותר.',
      position: 'bottom',
      buttonText: 'בסדר',
      type: 'danger',
      duration: 10000
    })
  }
}
