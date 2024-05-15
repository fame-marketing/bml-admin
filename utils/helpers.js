export const validateKey = (data) => {

  const accountKey = process.env.NN_API_TOKEN;

  if (data.headers["x-account-key"] !== accountKey) {
    return "incorrectKey";
  } else {
    return true;
  }

}

export const validatePayload = (data) => {
  if (Object.entries(data.body).length === 0) {
    return "emptyRequest";
  } else {
    return true;
  }
}

export const simplifyDateFormat = (date) => {
  return date.toLocaleString(date, {dateStyle:'medium',timeStyle:'medium'})
}

export const createReadableDate = (date) => {

  function force2Digits(number) {
    return number < 10 ? '0' + number : number;
  }

  const dateObj = new Date(date);
  const dateFormat = dateObj.getFullYear() + '-' + force2Digits(dateObj.getMonth() + 1) + '-' + force2Digits(dateObj.getDate())
  const timeFormat = force2Digits(dateObj.getHours()) + ':' + force2Digits(dateObj.getMinutes()) + ':' + force2Digits(dateObj.getSeconds())
  return dateFormat + " " + timeFormat
}