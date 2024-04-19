import Database from '../Database.js'

export default class deleteTempEvent {
  static delete (eventId) {

    this.database = new Database();

    const deleteSql = `DELETE FROM nn_events_temp WHERE id = '${eventId}'`;
    this.database.QueryOnly(deleteSql);

  }

}