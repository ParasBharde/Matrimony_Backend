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

        let { userId, price, member_display_limit, subscription_start_date, subscription_end_date } = data;
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
}