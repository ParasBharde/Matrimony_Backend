const { start_date, card_detail, users_permissions_user, user_profile } = require('../services/subscriptions-details')
module.exports = {
    async create(ctx) {
      const { start_date, card_detail, users_permissions_user, user_profile, ...otherFields } = ctx.request.body;
  
      // Calculate the end date as one month from the start date
      const end_date = new Date(start_date);
      end_date.setMonth(end_date.getMonth() + 1);
  
      // Check if the current date is greater than or equal to the end date
      const currentDate = new Date();
      const status = currentDate >= end_date ? 'expired' : 'active';
  
      try {
        const subscriptionDetail = await strapi.services['api::subscriptions-details.subscriptions-details'].create({
          start_date,
          end_date,
          card_detail,
          status,
          user,
          user_profile,
          ...otherFields,
        });
  
        return subscriptionDetail;
      } catch (error) {
        console.error('Error creating subscription:', error);
        ctx.response.status = 500;
        ctx.response.body = { error: 'An error occurred during subscription creation.' };
      }
    },
  };