import logger from '../bin/winston.js'
import Database from '../data/Database.js'

export async function getFormSubmissions(orderBy = 'SubmissionDate', limit = 30) {

  const db = new Database();
  const forms = await db.readPool(
    `SELECT *
                FROM form_submissions
                ORDER BY ${orderBy}
                LIMIT ${limit}`
  )

  forms.forEach(form => {
    form.SubmissionDate = simplifyDateFormat(form.SubmissionDate);
    if (form.SpamScore >= .7) {
      form.SpamRank = 'Safe'
    } else if (form.SpamScore < .7 && form.SpamScore >= .3 ) {
      form.SpamRank = 'Suspicious'
    } else if (form.SpamScore < .3) {
      form.SpamRank = "Likely Spam"
    }
  });

  logger.info('results: %j', forms);

  return forms

}

export const render = async (req,res) => {

  res.render(
    'forms',
    {
      layout: 'default',
      title: 'Building Material Liquidation Form Submissions',
      description: 'Building Material Liquidation Form Submissions',
      formSubmissions: await getFormSubmissions()
    }
  );

}

export const getEvents = async (req,res) => {

  const db = new Database(),
        formsData = await db.readPool(
          `SELECT *
                FROM form_submissions
                ORDER BY SubmissionDate
                LIMIT 30`
        );

  res.send(formsData);

}

function simplifyDateFormat(date) {
  return date.toLocaleString(date, {dateStyle:'medium',timeStyle:'medium'})
}