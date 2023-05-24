const winston = require('../bin/winston')
      nnData = require('../model/NearbyNow/getReviewsAndCheckins.js')
;

exports.render = async (req,res) => {

  const nnFetch = new nnData(req)

  const testData = await nnFetch.getNnData()

  res.render(
    'datatest',
    {
      layout: 'datatest',
      title: 'Nearby Now Dashboard Data Test Page',
      description: 'Nearby Now Dashboard Data Test Page',
      nnData: ''
    }
  );

}

getNnData = async(req,res) => {

  let data = "test, data.";

  res.send(data);

}
