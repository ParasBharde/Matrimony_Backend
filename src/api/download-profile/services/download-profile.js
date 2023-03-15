'use strict';

/**
 * download-profile service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::download-profile.download-profile');
