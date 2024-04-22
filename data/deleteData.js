import Database from "./Database.js";

export default class deleteData {

  constructor() {

    this.database = new Database();

  }

  async deleteTempEvent(eventId) {
    const deleteSql = `DELETE FROM nn_events_temp WHERE id = '${eventId}'`;
    await this.database.QueryOnly(deleteSql);
  }

}