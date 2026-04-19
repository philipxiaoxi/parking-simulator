'use strict';

module.exports = app => {
  const { router, controller } = app;
  router.prefix('/api');
  router.get('/maps', controller.map.index);
  router.get('/maps/:id', controller.map.show);
  router.post('/maps', controller.map.create);
  router.put('/maps/:id', controller.map.update);
  router.delete('/maps/:id', controller.map.destroy);
};
