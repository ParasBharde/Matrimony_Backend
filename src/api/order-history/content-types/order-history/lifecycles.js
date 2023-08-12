function calculateEndDate(startDate, durationMonths) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    return end;
}

module.exports = {

    async beforeCreate(event) {
        var { data, where, select, populate } = event.params;
        const ctx = strapi.requestContext.get();

        let { userId, price, subscription_start_date, subscription_end_date } = data;
        data.user_id = userId;
        //start date should be less than end date
        if(new Date(subscription_start_date) < new Date(subscription_end_date)) return ctx.throw(400, `Subscription start date should be less than end date`)
        const getUserById = await strapi.query("api::profile.profile").findOne({where: {id: userId}})
        if(!getUserById) return ctx.throw(404, `User not found`)
        // const getOrderById = await strapi.query("api::order-history.order-history").findOne({where: {user_id: userId}})
        // if(getOrderById) return ctx.throw(409, `Subscription already exists. Please upgrade your plan to renew.`)

        if(price == 1000 || data.purchase_plan == "basic") {
            const basicDurationMonths = 24; // 2 years
            const basicEndDate = calculateEndDate(subscription_start_date, basicDurationMonths);
            data.subscription_end_date = new Date(basicEndDate);
            data.member_display_limit = 50;
            data.purchase_plan = "basic";
            data.status = 'active'
            data.marriage_fix_status = 'not_applicable'
            data.price = 1000;
        }
        else if(price == 1500 || data.purchase_plan == "super") {
            const superDurationMonths = 36; // 3 years
            const superEndDate = calculateEndDate(subscription_start_date, superDurationMonths);
            data.subscription_end_date = new Date(superEndDate);
            data.price = 1500;
            data.member_display_limit = 100;
            data.purchase_plan = "super";
            data.status = 'active'
            data.marriage_fix_status = 'not_applicable'
        }
        else if(price == 2000 || data.purchase_plan == "master") {
            const masterDurationMonths = 240; // 20 years
            const masterEndDate = calculateEndDate(subscription_start_date, masterDurationMonths);
            data.subscription_end_date = new Date(masterEndDate);
            data.member_display_limit = 200;
            data.purchase_plan = "master";
            data.price = 2000;
            data.marriage_fix_status = 'applicable'
            data.marriage_fixed = false
            data.status = 'active'
        }
    },

    async afterCreate(event) {
        console.log("afterCreate")
        var { data, where, select, populate } = event.params;
        const ctx = strapi.requestContext.get();
        //get the latest order
        const getLastestOrder = await strapi.query("api::order-history.order-history").findOne({where: {id: event.result.id}, populate:["user_id"]})
        getLastestOrder.order_id = getLastestOrder.id;
        //get the active subcription
        const getActiveSubcription = await strapi.query("api::user-active-plan.user-active-plan").findOne({where: {user_id: getLastestOrder.user_id.id}})
        //if master plan then directly take it as current subcription
        if(getLastestOrder && getLastestOrder.purchase_plan == "master") {
            const latestOrderId = getLastestOrder.id;
            delete getLastestOrder.id;
            if(getActiveSubcription) {
                const member_display_limit = getLastestOrder.member_display_limit
                delete getLastestOrder.member_display_limit
                await strapi.entityService.update('api::user-active-plan.user-active-plan', getActiveSubcription.id, {
                    data: {
                        ...getLastestOrder,
                        member_display_limit: getActiveSubcription.member_display_limit + member_display_limit,
                    }
                })
                await strapi.entityService.update('api::order-history.order-history', latestOrderId, {
                    data: {
                        status: "expired"
                    }
                })
            }
            else {
                await strapi.entityService.create('api::user-active-plan.user-active-plan', {
                    data: getLastestOrder
                })
                await strapi.entityService.update('api::order-history.order-history', latestOrderId, {
                    data: {
                        status: "expired"
                    }
                })
            }
        }

        //if basic or super plan then check if any active subcription exists
        //if exist then take increase the end date of active subcription till the next end date of new subcription
        else if(getLastestOrder && (getLastestOrder.purchase_plan == "basic")) {
            const latestOrderId = getLastestOrder.id;
            delete getLastestOrder.id;
            const getActiveOrder = await strapi.query("api::order-history.order-history").findMany({
                filters: {
                    user_id: getLastestOrder.user_id.id,
                    purchase_plan: "basic",
                    status: "active"
                },
                sort: { createdAt: 'asc' }
            })
        
            if(getActiveSubcription) {
                let totalEndDate = new Date(getActiveSubcription.subscription_end_date); // Initialize with the current date or a specific start date
                if (getActiveOrder.length > 0) {
                    for (let order of getActiveOrder) {
                        if(order.id == getActiveSubcription.id) continue;
                        totalEndDate = calculateEndDate(totalEndDate, 24);
                    }
                }
                getLastestOrder.subscription_start_date = new Date(getActiveOrder[0].subscription_start_date);
                getLastestOrder.subscription_end_date = new Date(totalEndDate);
                const member_display_limit = getLastestOrder.member_display_limit
                delete getLastestOrder.member_display_limit
                await strapi.entityService.update('api::user-active-plan.user-active-plan', getActiveSubcription.id, {
                    data: {
                        ...getLastestOrder,
                        member_display_limit: getActiveSubcription.member_display_limit + member_display_limit,
                    }
                })
                await strapi.entityService.update('api::order-history.order-history', latestOrderId, {
                    data: {
                        status: "expired"
                    }
                })
            }
            else {
                await strapi.entityService.create('api::user-active-plan.user-active-plan', {
                    data: getLastestOrder
                })
                await strapi.entityService.update('api::order-history.order-history', latestOrderId, {
                    data: {
                        status: "expired"
                    }
                })
            }
        }
        //for super plan
        else if(getLastestOrder && (getLastestOrder.purchase_plan == "super")) {
            const latestOrderId = getLastestOrder.id;
            delete getLastestOrder.id;
            const getActiveOrder = await strapi.query("api::order-history.order-history").findMany({
                filters: {
                    user_id: getLastestOrder.user_id.id,
                    purchase_plan: "super",
                    status: "active"
                },
                sort: { createdAt: 'asc' }
            })
        
            if(getActiveSubcription) {
                let totalEndDate = new Date(getActiveSubcription.subscription_end_date); // Initialize with the current date or a specific start date
                if (getActiveOrder.length > 0) {
                    for (let order of getActiveOrder) {
                        if(order.id == getActiveSubcription.id) continue;
                        totalEndDate = calculateEndDate(totalEndDate, 36);
                    }
                }
                getLastestOrder.subscription_start_date = new Date(getActiveOrder[0].subscription_start_date);
                getLastestOrder.subscription_end_date = new Date(totalEndDate);
                const member_display_limit = getLastestOrder.member_display_limit
                delete getLastestOrder.member_display_limit
                await strapi.entityService.update('api::user-active-plan.user-active-plan', getActiveSubcription.id, {
                    data: {
                        ...getLastestOrder,
                        member_display_limit: getActiveSubcription.member_display_limit + member_display_limit,
                    }
                })
                await strapi.entityService.update('api::order-history.order-history', latestOrderId, {
                    data: {
                        status: "expired"
                    }
                })
            }
            else {
                await strapi.entityService.create('api::user-active-plan.user-active-plan', {
                    data: getLastestOrder
                })
                await strapi.entityService.update('api::order-history.order-history', latestOrderId, {
                    data: {
                        status: "expired"
                    }
                })
            }
        }
    }
}