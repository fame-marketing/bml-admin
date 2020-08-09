const Db = require('../Database');

  class deleteTempEvent {

    static delete (eventId) {

      this.database = new Db();

      const deleteSql = `DELETE FROM nn_events_temp WHERE id = '${eventId}'`;
      this.database.QueryOnly(deleteSql);

    }

  }

module.exports = deleteTempEvent;
