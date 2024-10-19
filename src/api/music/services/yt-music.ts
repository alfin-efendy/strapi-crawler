import { firefox } from "playwright";

module.exports = {
  async getUrl(artist: string, track: string): Promise<string> {
    const browser = await firefox.launch();
    const page = await browser.newPage();
    const baseUrl = "https://music.youtube.com";

    await page.goto(`${baseUrl}/search?q=${artist}+${track}`);

    const element = await page.locator(`[href*="watch?v="]`).first();
    const urlSong = await element.getAttribute("href");

    await browser.close();

    return `${baseUrl}/${urlSong}`;
  },
};
