const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  const currentDate = new Date()

  try {
    const getAllOrderHistory = await strapi.query("api::order-history.order-history").findMany({populate: ["user_id"]})
    const getAllSubscriptions = await strapi.query("api::user-active-plan.user-active-plan").findMany({populate: ["user_id"]})

    // Create a mapping of user IDs to subscriptions
    const userSubscriptionsMap = new Map();
    for (let subscription of getAllSubscriptions) {
      userSubscriptionsMap.set(subscription.user_id.id, subscription);
    }

    for (let orderHistory of getAllOrderHistory) {
      const userId = orderHistory.user_id.id;

      if (userSubscriptionsMap.has(userId)) {
        const subscription = userSubscriptionsMap.get(userId);
        const subscriptionEndDate = new Date(subscription.subscription_end_date).toDateString();
        
        // Check if subscription_end_date is the current date
        if (subscriptionEndDate === currentDate.toDateString()) {
          // Decrement the member_limit_count
          await strapi.entityService.update('api::user-active-plan.user-active-plan', subscription.id, {
            data: {
              member_display_limit: subscription.member_display_limit - orderHistory.member_display_limit,
              member_viewed: 0,
            }
          })
        }
      }
    }

    await strapi.query("api::user-active-plan.user-active-plan").updateMany({
      where: {
        subscription_end_date: { $lte: currentDate }
      },
      data: {
        status: "expired",
      },
    });
    console.log('Expired subscriptions updated.');
  } catch (error) {
    console.error('Error updating subscriptions:', error);
  }
});
