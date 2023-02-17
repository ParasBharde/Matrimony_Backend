'use strict';

/**
 * profile-image service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::profile-image.profile-image');
