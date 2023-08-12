const { updateSubscription, updateStatusOfMarriageFix, increaseMemeberView } = require('../services/order-service')

module.exports = {
    async updateSubscription(ctx) {
      try {
        return await updateSubscription(ctx.request.body, ctx)
      } catch (err) {
        ctx.badRequest(err);
      }
    },

    async updateStatusOfMarriageFix(ctx) {
      try {
        return await updateStatusOfMarriageFix(ctx.request.body, ctx)
      } catch (err) {
        ctx.badRequest(err);
      }
    },

    async increaseMemeberView(ctx) {
      try {
        return await increaseMemeberView(ctx.query.user_id, ctx)
      } catch (err) {
        ctx.badRequest(err);
      }
    },
};