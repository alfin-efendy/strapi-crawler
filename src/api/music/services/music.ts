/**
 * music service
 */

import { factories } from "@strapi/strapi";
import { errors } from '@strapi/utils';

const { ApplicationError } = errors;

export default factories.createCoreService("api::music.music", ({ strapi }) =>  ({
  async create(params) {
    // Validate params
    const { artist, track } = params
    if (!artist || !track) {
      throw new ApplicationError("Please Passing Data Artist & Track", {
        status: 400,
        code: "BAD_REQUEST",
      });
    }

    // Get detail from Spotify and validate if not found
    const detail = await strapi.service("api::music.spotify").getDetail(artist, track);
    if (!detail) {
      throw new ApplicationError("Music not found", {
        status: 404,
        code: "NOT_FOUND",
      });
    }

    const existing = await strapi.query("api::song.song").findOne({ where: { id_external: detail.id } });

    if (existing) {
      throw new ApplicationError("Music already exists", {
        status: 409,
        code: "CONFLICT",
      });
    }

    
    // Get URL from YouTube Music and validate if not found
    const url = await strapi.service("api::music.yt-music").getUrl(artist, track);
    if (!url) {
      throw new ApplicationError("Music not found", {
        status: 404,
        code: "NOT_FOUND",
      });
    }

    const artists = detail.artists.map((artist) => ({
      id_external: artist.id,
      name: artist.name,
      type: artist.type,
    }));
    
    let artistsConnected = [];
    
    for (const artist of artists) {
      const result = await strapi.service("api::artist.artist").create({data: artist});
      artistsConnected.push(result.documentId);
    }
    
    const album = {
      name: detail.album.name,
      type: detail.album.type,
      id_external: detail.album.id,
      releaseDate: detail.album.releaseDate,
      releaseDatePrecision: detail.album.releaseDatePrecision,
      // image: detail.album.images[0].url,
      artists: {
        connect: artistsConnected,
      },
    }

    const albumConnected = await strapi.service("api::album.album").create({data: album});
    
    const song = {
      name: detail.name,
      type: detail.type,
      id_external: detail.id,
      explicit: detail.explicit,
      duration_ms: detail.durationMs,
      album: {
        connect: albumConnected.documentId,
      },
      artists: {
        connect: artistsConnected,
      },
    }

    const songConnected = await strapi.service("api::song.song").create({data: song});

    const music = {
      url,
      song: {
        connect: songConnected.documentId,
      },
    }

    return await super.create({data: music});
  }
}));