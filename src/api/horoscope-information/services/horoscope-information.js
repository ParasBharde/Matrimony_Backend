'use strict';

/**
 * horoscope-information service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::horoscope-information.horoscope-information');
