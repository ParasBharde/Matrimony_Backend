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

const increaseMemeberView = async (user_id, ctx) => {
    try{
        if(user_id) {
            const getUserById = await strapi.query("api::profile.profile").findOne({where: {id: user_id}})
            if(!getUserById) return ctx.throw(404, `User not found`)
            const getSubscriptionByUserId = await strapi.query("api::user-active-plan.user-active-plan").findOne({where: {user_id: user_id}})
            if(!getSubscriptionByUserId) return ctx.throw(404, `Order not found`)
            //check memeber view limit exceeded
            if(getSubscriptionByUserId.member_viewed >= getSubscriptionByUserId.member_display_limit) return ctx.throw(400, `Member view limit exceeded. Please upgrade your plan to view more members.`)
            await strapi.entityService.update(
                "api::user-active-plan.user-active-plan", getSubscriptionByUserId.id,
                {
                  data: {
                    member_viewed: Number(getSubscriptionByUserId.member_viewed) + 1
                  }
                }
            )
            await strapi.entityService.update(
                "api::profile.profile", getUserById.id,
                {
                  data: {
                    total_profile_viewed: Number(getUserById.total_profile_viewed) + 1,
                  }
                }
            )
            return ctx.send({message: "success"})
        }
    }
    catch(e){
        throw new Error(e)
    }
}
module.exports = {
    updateStatusOfMarriageFix,
    increaseMemeberView
}