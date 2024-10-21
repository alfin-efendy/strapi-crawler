/**
 * album service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::album.album', ({ strapi }) => ({
  async createWithCover(params, url:string) {
    const { data } = params;
    const { 
      name, 
      type, 
      id_external, 
      releaseDate,
      releaseDatePrecision,
      artists,
    } = data;

    const existing = await strapi.query('api::album.album').findOne({ where: { id_external } });
    if (existing) {
      return existing;
    }

    const albumCoverFile = await strapi.service("api::storage.storage").uploadFromUrl('albums', name, url, "cover");
    const album = {
      name,
      type,
      id_external,
      releaseDate,
      releaseDatePrecision,
      image: albumCoverFile.id,
      artists,
    }

    return await super.create(album);

    return null;
  }  
}));
