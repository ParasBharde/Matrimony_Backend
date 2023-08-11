'use strict';

/**
 * util service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::util.util');
