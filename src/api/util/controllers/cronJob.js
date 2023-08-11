const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  console.log(new Date());
  const currentDate = new Date()

  try {
    await strapi.query("api::order-history.order-history").updateMany({
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
