const Db = require('./Database'),
      winston = require('../bin/winston')
;

class deleteData {

  constructor() {

    this.database = new Database();

  }

  async deleteTempEvent(eventId) {
    const deleteSql = `DELETE FROM nn_events_temp WHERE id = '${eventId}'`;
    await this.database.QueryOnly(deleteSql);
  }

}

module.exports = deleteData;