const Db = require('../data/Database')
;

class updateHandler{

  constructor (nnData) {

    this.parent = new module.parent.exports();

    this.data = nnData;

    this.data.forEach( (nnEvent) => {

      this.updateLocationValues(nnEvent);
      this.saveEventData(nnEvent);

    });

  }

  updateLocationValues (nnEvent) {
    const city = nnEvent.location.city;

    let sql = "UPDATE nn_city_totals SET total = total  + 1 WHERE cityName = " + city;

    //this.parent.writePool(sql, values);
  }

  saveEventData (nnEvent) {
    delete nnEvent.id;

    const values = nnEvent;

    let sql = "INSERT INTO nn_checkins SET ?";

    //this.parent.writePool(sql, values);
  }

  //Add a call to remove rows form nn_checkins when they are done being delt with

}

module.exports = updateHandler;