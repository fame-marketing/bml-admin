const dbReader = require('../data/Read');

class cityCheck {

	constructor () {
		this.reader = new dbReader();
		
		this.newCheckins = this.reader("nn_checkins");
		this.newReviews = this.reader("nn_reviews");
		
	}
	
}

module.exports = cityCheck;