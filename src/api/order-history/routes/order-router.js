'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/plan/updateStatusOfMarriageFix',
      handler: 'order-controller.updateStatusOfMarriageFix',
      config: {
        find: {
          auth: true,
        }
      }
    },

    {
      method: 'POST',
      path: '/plan/increaseMemeberView',
      handler: 'order-controller.increaseMemeberView',
      config: {
        find: {
          auth: true,
        }
      }
    },
  ]
};
