import nnData from '../model/NearbyNow/getReviewsAndCheckins.js'

export const render = async (req,res) => {

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

export const getNnData = async(req,res) => {

  let data = "test, data.";

  res.send(data);

}
