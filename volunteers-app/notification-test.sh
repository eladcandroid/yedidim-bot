curl -H "Content-Type: application/json; charset=utf-8" -X POST https://onesignal.com/api/v1/notifications -d '{
  "app_id": "e5ef1cdc-a50b-430f-8fac-b7702740c59a",
  "include_player_ids": ["fa6ed71a-66b3-41f8-8f9d-101d2ce2c2c2"],
  "headings": {"en": "אירוע חדש"},
  "contents": {"en": "היי אלן, אתה נדרש בקריאה מסוג פונצ׳ר דרך הנשיאים 45 י-ם. לחץ לפרטים נוספים"},
  "data": {
      "key": "-LDbbpzvdZWxljGGYbWO",
      "type": "event"
  },
  "ios_sound": "notification.caf"
}'