import FileUtils from "../data/FileSystem/FileUtils.js";
import Database from "../data/Database.js";
import {validateKey} from "../utils/helpers.js";

const db = new Database(),
      fileUtils = new FileUtils(),
      directory = fileUtils.fixSlashes(process.env.NN_FILE_DESTINATION)
;

async function getNewPages() {
  const sql = `SELECT *
               FROM nn_city_totals
               WHERE City != ''
               ORDER BY Verified ASC, PageCreatedDate DESC
               LIMIT 20`;
  const rows = await db.readPool(sql);
  rows.forEach(row => {
    if (row.PageCreatedDate !== null) {
      row.PageCreatedDate = simplifyDateFormat(row.PageCreatedDate);
    }
  });
  return rows;
}

async function getRecentEvents() {
  const sql = `SELECT EventType, EventTime, UserName, City, State
               FROM nn_events
                        INNER JOIN nn_checkins
                                   ON nn_events.EventId = nn_checkins.EventId
               UNION ALL
               SELECT EventType, EventTime, UserName, City, State
               FROM nn_events
                        INNER JOIN nn_reviews
                                   ON nn_events.EventId = nn_reviews.EventId
               ORDER BY EventTime DESC
               LIMIT 15`
  ;
  const rows = await db.readPool(sql);
  rows.forEach(row => {
    row.EventType = (row.EventType === "checkin.created") ? 'Checkin' : 'Review';
    row.EventTime = simplifyDateFormat(row.EventTime);
  });
  return rows;
}

async function getPendingEvents() {

  const sql = `SELECT COUNT(*) FROM nn_events_temp`;
  const rows = await db.readPool(sql);
  return rows[0]['COUNT(*)'];

}

async function markAsValid(url) {

  const sql = `UPDATE nn_city_totals SET Verified = 1 WHERE Url = "${url}"`;
  const res = await db.readPool(sql);
  return res.affectedRows > 0 ? "verified" : "error : " + res.serverStatus;

}

function simplifyDateFormat(date) {
  return date.toLocaleString(date, {dateStyle:'medium',timeStyle:'medium'})
}

async function getServiceAreaList() {
  const sql = `SELECT City, Url FROM nn_city_totals WHERE Created = 1`;
  return await db.readPool(sql);
}

async function getAreaDetails(slug) {
  const sql = `SELECT City as city, State as state, Url as url FROM nn_city_totals WHERE Url = "${slug}"`;
  const rows = await db.readPool(sql);
  return rows.length > 0 ? rows[0] : null;
}

export const render = async (req, res) => {

  res.render('nearbynow', {
    layout: 'default',
    template: 'admin-template',
    title: 'Nearby Now Webhook Admin Page',
    description: 'This page will be a dashboard with details on pages created, recent nearby now events and buttons allowing you to remove pages, change SEO data and such.',
    pages: await getNewPages(),
    events: await getRecentEvents(),
    pendingEvents: await getPendingEvents(),
    hrefBase: fileUtils.fixSlashes(process.env.URL) + '/' + fileUtils.fixSlashes(directory)
  });

}

export const validatePage = async (req, res) => {

  if (typeof req.body.url === "string" && req.body.url !== '') {
    const url = req.body.url;
    const validResult = await markAsValid(url);
    res.send(validResult);
  }

}

export const getServiceAreas = async(req, res) => {

  const validKey = validateKey(req)

  if (validKey === true) {
    const serviceAreaList = await getServiceAreaList()

    res.send(serviceAreaList)
  } else {
    res.status(403).end();
  }

}

export const getServiceAreaDetails = async(req, res) => {

  const validKey = validateKey(req)

  if (validKey === true) {
    const serviceAreaList = await getAreaDetails(req.params.area)

    res.send(serviceAreaList)
  } else {
    res.status(403).end();
  }

}