import Database from '../Database.js'

export default class storeRecentEvent {

  static store(eventId, eventTime, eventType) {

    this.database = new Database();

    const eventSQL = `INSERT IGNORE INTO nn_events SET ?`;

    const eventData = {
      "EventId":eventId,
      "EventTime":eventTime,
      "EventType":eventType
    };

    this.database.writePool(eventSQL, eventData);

  }

}