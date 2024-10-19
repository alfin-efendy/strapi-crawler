/**
 * spotify service
 */

import axios from "axios";

let accessToken = "";
// Create instance axios
const apiSpotify = axios.create({
  baseURL: "https://api.spotify.com/v1",
});

// Add request interceptor
apiSpotify.interceptors.request.use(
  (config) => {
    // Add authentication token to header
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiSpotify.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // console.error("Response error:", error);

    // Handling if response status is 401 (Unauthorized)
    if (error.status === 401) {
      console.log("Get new access token");
      axios
        .post(
          "https://accounts.spotify.com/api/token",
          {
            grant_type: "client_credentials",
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
            },
          }
        )
        .then((res) => {
          accessToken = res.data.access_token;
          error.config.headers.Authorization = `Bearer ${accessToken}`;

          return apiSpotify(error.config);
        })
        .catch((error) => {
          // console.error("Get access token error:", error);
          console.error("Get access token error:");
        });

      return apiSpotify(error.config);
    }

    return Promise.reject(error);
  }
);

interface SpotifyTrack {
  id: string;
  name: string;
  type: string;
  durationMs: number;
  explicit: boolean;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

interface SpotifyArtist {
  id: string;
  name: string;
  type: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  type: string;
  releaseDate: string;
  releaseDatePrecision: string;
  images: { url: string }[];
  artists: SpotifyArtist[];
}

module.exports = {
  async getDetail(artist: string, track: string) : Promise<SpotifyTrack | null> {
    const response = await apiSpotify
      .get<SpotifyTrack[]>(
        `/search?q=track%253A${track}%2520artist%253A${artist}&type=track&limit=1`
      )
      .then((res) => res["tracks"].items)
      .catch((error) => console.error("Get track detail error:", error));

    if (response.length === 0) {
      return null;
    }

    return response[0];
  },
};
