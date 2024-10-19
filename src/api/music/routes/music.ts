/**
 * music router
 */

// import { factories } from '@strapi/strapi';

// export default factories.createCoreRouter('api::music.music', {
//   config
// });

// module.exports = {
//   routes: [
//     {
//       method: "GET",
//       path: "/music",
//       handler: "music.create",
//       config: {
//         policies: [],
//         middlewares: [],
//       },
//     },
//   ],
// };

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/music",
      handler: "music.create",
      config: {
        middlewares: [],
      },
    },
  ],
};
