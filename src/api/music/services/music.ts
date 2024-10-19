/**
 * music service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService("api::music.music", ({ strapi }) =>  ({
  async create(params) {
    // Validate params
    const { artist, track } = params
    if (!artist || !track) {
      console.warn("Artist or track not found");
      return null;
    }

    // Get detail from Spotify and validate if not found
    const detail = await strapi.service("api::music.spotify").getDetail(artist, track);
    if (!detail) {
      console.warn("Detail not found");
      return null;
    }
    
    // Get URL from YouTube Music and validate if not found
    const url = await strapi.service("api::music.yt-music").getUrl(artist, track);
    if (!url) {
      console.warn("URL not found");
      return null;
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

    const result = await super.create({data: music});

    // const data = {
    //   url,
    //   song: {
    //     name: detail.name,
    //     duration: detail.durationMs,
    //     explicit: detail.explicit,
    //     album: {
    //       name: detail.album.name,
    //       releaseDate: detail.album.releaseDate,
    //       releaseDatePrecision: detail.album.releaseDatePrecision,
    //       image: detail.album.images[0].url,
    //       artist: {
    //         name: detail.album.artists[0].name,
    //       },
    //     },
    //     artists: detail.artists.map((artist) => ({
    //       id_external: artist.id,
    //       name: artist.name,
    //       type: artist.type,
    //     })),
    //   }
    // }

    // console.log("Data is: ", data);

    // const result = await super.create({data: url});

    // console.log("Song is: ", result);
  
    return result;
  }
}));