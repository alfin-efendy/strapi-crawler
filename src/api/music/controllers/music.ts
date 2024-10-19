/**
 * music controller
 */


// import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::music.music');


module.exports = {
    /**
     * Create a music record.
     *
     * @return {Object}
     */

    async create(ctx) {
      const {artist, track} = ctx.request.body;
      const song = await strapi.service('api::music.music').create({artist, track});

      console.log("Song is: " ,song);

      return {
          message: "create music",
          song
      }
    },

    /**
     * Retrieve records.
     *
     * @return {Array}
     */

    async find(ctx) {
        return "Hello World";
    },

    /**
     * Retrieve a record.
     *
     * @return {Object}
     */

    async findOne(ctx) {
        return strapi.services.music.findOne(ctx.params);
    },

    /**
     * Update a record.
     *
     * @return {Object}
     */

    async update(ctx) {
        return strapi.services.music.update(ctx.params, ctx.request.body);
    },

    /**
     * Destroy a record.
     *
     * @return {Object}
     */

    async delete(ctx) {
        return strapi.services.music.delete(ctx.params);
    }
};