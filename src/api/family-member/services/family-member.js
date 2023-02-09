'use strict';

/**
 * family-member service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::family-member.family-member');
