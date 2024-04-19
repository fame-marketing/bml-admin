import Database from "./Database.js";

/*
 | @data -- an object containing the event body as it was sent from nearby now
 | @requestType -- a string of either checkin or review.
 | Creates new rows in the temp db tables using the event data.
*/

export default class CreateWebhookEvent {

  constructor(data) {

    this.data = data;
    this.database = new Database();
    const value = {
      "EventData": JSON.stringify(this.data)
    };

    this.database.writePool("INSERT INTO nn_events_temp SET ?", value);

  }

}