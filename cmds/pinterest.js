const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "pinterest",
  description: "Search for images on Pinterest",
  author: "developer",

  async execute(senderId, args, pageAccessToken, sendMessage) {
    try {
      if (!args.length) {
        return sendMessage(senderId, {
          text: "Usage: pinterest [search term] - [number of images]\nexample: pinterest dog - 10"
        }, pageAccessToken);
      }

      const [searchTerm, count] = args.join(" ").split(" - ");

      if (!searchTerm || !count) {
        return sendMessage(senderId, {
          text: "🖼️ Invalid format! Use the command like this:\n\npinterest [search term] - [number of images]\nExample: pinterest cats - 5"
        }, pageAccessToken);
      }

      const numOfImages = parseInt(count) || 5;
      if (isNaN(numOfImages) || numOfImages < 1 || numOfImages > 20) {
        return sendMessage(senderId, {
          text: "⚠️ Enter a number between 1 and 20.\n\nExample: pinterest car - 4"
        }, pageAccessToken);
      }

      const apiUrl = `https://kaiz-apis.gleeze.com/api/pinterest?search=${encodeURIComponent(searchTerm)}`;
      const response = await axios.get(apiUrl);
      const data = response.data.data;

      if (!data || data.length === 0) {
        return sendMessage(senderId, { text: `No results found for "${searchTerm}".` }, pageAccessToken);
      }

      const imageUrls = data.slice(0, numOfImages);
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      for (const [i, url] of imageUrls.entries()) {
        const imgPath = path.join(cacheDir, `pinterest_${Date.now()}_${i}.jpg`);

        // Download image
        const imgRes = await axios.get(url, { responseType: "stream" });
        await new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(imgPath);
          imgRes.data.pipe(writer);
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        // Send image
        await sendMessage(senderId, {
          attachment: fs.createReadStream(imgPath)
        }, pageAccessToken);

        // Delete temp file
        await fs.unlink(imgPath);
      }

    } catch (error) {
      console.error("Failed to retrieve images from Pinterest:", error);
      sendMessage(senderId, {
        text: `❌ Failed to retrieve images. Error: ${error.message || error}`
      }, pageAccessToken);
    }
  }
}