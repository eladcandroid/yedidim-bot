import dateFormat from 'dateformat';

export const CallStatus = {Submitted: 'submitted', InProgress: 'in-progress'};

export const objectToArray = (obj) => {
  let arr = [];
  for (const key in obj){
    if (obj.hasOwnProperty(key)) {
      let item = obj[key];
      item.key = key;
      arr.push(item);
    }
  }
  return arr;
};

export const formatCallCase = (call) => {
  if (!call.details.case){
    return 'לא ידוע';
  }
  const cases = ['כבלים', 'פנצ\'ר', 'קומפרסור', 'דלת נעולה', 'שמן\\מים\\דלק', 'חילוץ', 'קודנית', 'פנצ\'ר (אין רזרבי)', 'אחר'];
  return cases[call.details.case];
};

export const formatCallTime = (call) => {
  return dateFormat(new Date(call.timestamp), "ddd mmm-d HH:mm");
};

export const getCallStatus = (call) => {
  if (call.lastMessage === 'confirm_request'){
    return CallStatus.Submitted;
  }
  return CallStatus.InProgress;
};
