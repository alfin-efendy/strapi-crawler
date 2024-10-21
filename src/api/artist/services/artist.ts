/**
 * artist service
 */

import { factories } from '@strapi/strapi';


export default factories.createCoreService('api::artist.artist', ({ strapi }) => ({
  async create(params) {
    const { data } = params;
    const { id_external } = data;

    const existing = await strapi.query('api::artist.artist').findOne({ where: { id_external } });
    if (existing) {
      return existing;
    }

    return await super.create(params);

    return null;
  }
}));
