'use strict';

/**
 * user-login service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-login.user-login');
