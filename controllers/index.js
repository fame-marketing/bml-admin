export const render = async (req, res) => {

  res.render('admin', {
    layout: 'default',
    template: 'admin-template',
    title: 'Nearby Now Webhook Admin Page',
    description: 'The Fame Admin Interface',
  });

}