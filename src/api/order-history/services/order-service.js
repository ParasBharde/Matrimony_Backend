const updateStatusOfMarriageFix = async (reqBody, ctx) => {
    try{
        const { order_id, marriage_fixed } = reqBody;
        if(order_id && marriage_fixed) {
            const getOrderById = await strapi.query("api::order-history.order-history").findOne({where: {id: order_id}})
            if(!getOrderById) return ctx.throw(404, `Order not found`)
            if(getOrderById.purchase_plan == "master") {
                return await strapi.entityService.update(
                    "api::order-history.order-history", getOrderById.id,
                    {
                      data: {
                        marriage_fixed: marriage_fixed,
                        status: (marriage_fixed == true) ? 'expired' : getOrderById.status,
                        subscription_end_date: (marriage_fixed == true) ? new Date() : getOrderById.subscription_end_date,
                      }
                    }
                )
            }
            else {
                return await strapi.entityService.update(
                    "api::order-history.order-history", getOrderById.id,
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
            const getOrderByUserId = await strapi.query("api::order-history.order-history").findOne({where: {user_id: user_id}})
            if(!getOrderByUserId) return ctx.throw(404, `Order not found`)
            //check memeber view limit exceeded
            if(getOrderByUserId.member_viewed >= getOrderByUserId.member_display_limit) return ctx.throw(400, `Member view limit exceeded. Please upgrade your plan to view more members.`)
            const updateView = await strapi.entityService.update(
                "api::order-history.order-history", getOrderByUserId.id,
                {
                  data: {
                    member_viewed: getOrderByUserId.member_viewed + 1,
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