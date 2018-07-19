curl -H "Content-Type: application/json; charset=utf-8" -X POST https://onesignal.com/api/v1/notifications -d '{
  "app_id": "e5ef1cdc-a50b-430f-8fac-b7702740c59a",
  "include_player_ids": ["a19ce0e9-b13d-41e0-8450-71f81d42581e"],
  "headings": {"en": "אירוע חדש"},
  "contents": {"en": "היי אלן, אתה נדרש בקריאה מסוג פונצ׳ר דרך הנשיאים 45 י-ם. לחץ לפרטים נוספים"},
  "data": {
      "key": "-LDbbpzvdZWxljGGYbWO",
      "type": "event"
  },
  "ios_sound": "notification.caf",
  "android_sound": "notification"
}'