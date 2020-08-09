const Db = require('../Database');

class storeRecentEvent {

  static store(eventId, eventTime, eventType) {

    this.database = new Db();

    const eventSQL = `INSERT IGNORE INTO nn_events SET ?`;

    const eventData = {
      "EventId":eventId,
      "EventTime":eventTime,
      "EventType":eventType
    };

    this.database.writePool(eventSQL, eventData);

  }

}

module.exports = storeRecentEvent;
