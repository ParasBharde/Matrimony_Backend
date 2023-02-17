'use strict';

/**
 * user-login controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-login.user-login');
