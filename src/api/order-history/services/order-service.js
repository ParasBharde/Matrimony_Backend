const updateStatusOfMarriageFix = async (reqBody, ctx) => {
    try{
        const { user_id, marriage_fixed } = reqBody;
        if(user_id && marriage_fixed) {
            const getOrderByUserId = await strapi.query("api::order-history.order-history").findOne({filters: {user_id: user_id}, orderBy: { createdAt: 'DESC' },})
            if(!getOrderByUserId) return ctx.throw(404, `Order not found`)
            const getPlanByUserId = await strapi.query("api::user-active-plan.user-active-plan").findOne({where: {order_id: getOrderByUserId.id}})
            if(!getPlanByUserId) return ctx.throw(404, `No Subscription found`)
            if(getPlanByUserId.purchase_plan == "master") {
                return await strapi.entityService.update(
                    "api::user-active-plan.user-active-plan", getPlanByUserId.id,
                    {
                      data: {
                        marriage_fixed: marriage_fixed,
                        status: (marriage_fixed == true) ? 'expired' : getPlanByUserId.status,
                        subscription_end_date: (marriage_fixed == true) ? new Date() : getPlanByUserId.subscription_end_date,
                      }
                    }
                )
            }
            else {
                return await strapi.entityService.update(
                    "api::user-active-plan.user-active-plan", getPlanByUserId.id,
                    {
                      data: {
                        marriage_fixed: marriage_fixed,
                      }
                    }
                )
            }
        }
        ctx.throw(400, `some paramters are missing`)
    }
    catch(e){
        throw new Error(e)
    }
}

const increaseMemeberView = async (user_id, viewed_member_id, ctx) => {
  try {
    if (!user_id || !viewed_member_id) {
      return ctx.throw(400, 'Invalid input data');
    }

    // Fetch user and subscription data
    const getUserById = await strapi.query('api::profile.profile').findOne({ where: { id: user_id } });
    const getSubscriptionByUserId = await strapi.query('api::user-active-plan.user-active-plan').findOne({
      where: { user_id: user_id },
      populate: ['viewed_member_ids'],
    });

    if (!getUserById || !getSubscriptionByUserId) {
      return ctx.throw(404, 'User or order not found');
    }

    // Check whether the subscription is expired
    if (getSubscriptionByUserId.status === 'expired') {
      return ctx.throw(400, 'Your subscription is expired. Please renew your subscription to view more members.');
    }

    // Check if the member ID is already included
    if (getSubscriptionByUserId.viewed_member_ids.some(member => member.id == viewed_member_id)) {
      return ctx.throw(409, 'Member ID is already included');
    }

    // Check if member view limit is exceeded
    if (getSubscriptionByUserId.member_viewed >= getSubscriptionByUserId.member_display_limit) {
      return ctx.throw(400, 'Member view limit exceeded. Please upgrade your plan to view more members.');
    }

    // Prepare the updated viewed_member_ids array
    const updatedViewedMemberIds = [
      ...(getSubscriptionByUserId.viewed_member_ids || []), // Use existing array if available
      viewed_member_id, // Add the new member ID
    ];

    // Prepare the data for updates
    const subscriptionData = {
      member_viewed: Number(getSubscriptionByUserId.member_viewed) + 1,
      viewed_member_ids: updatedViewedMemberIds,
    };

    // If the view limit is reached after this view, set status to 'expired' and update subscription_end_date
    if (Number(getSubscriptionByUserId.member_viewed) + 1 === Number(getSubscriptionByUserId.member_display_limit)) {
      subscriptionData.status = 'expired';
      subscriptionData.subscription_end_date = new Date();
    }

    // Update user subscription and total_profile_viewed
    await strapi.entityService.update('api::user-active-plan.user-active-plan', getSubscriptionByUserId.id, {
      data: subscriptionData,
    });
    await strapi.entityService.update('api::profile.profile', getUserById.id, {
      data: { total_profile_viewed: Number(getUserById.total_profile_viewed) + 1 },
    });

    return ctx.send({ message: 'Success' });
  } catch (e) {
    throw new Error(e);
  }
};
module.exports = {
    updateStatusOfMarriageFix,
    increaseMemeberView
}