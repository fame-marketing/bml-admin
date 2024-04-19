export const validateKey = (data) => {

  const accountKey = process.env.accountKey;

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