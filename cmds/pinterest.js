const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "pinterest",
  usage: "pinterest <search term> - <number of images>",
  description: "Search for images on Pinterest",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (body, attachment = null) =>
      api.sendMessage(
        attachment ? { body, attachment } : { body },
        threadID,
        messageID
      );

    try {
      if (!args.length) {
        return send(
          "Usage: pinterest [search term] - [number of images]\nExample: pinterest dog - 10"
        );
      }

      const [searchTerm, count] = args.join(" ").split(" - ");
      if (!searchTerm || !count) {
        return send(
          "🖼️ Invalid format! Use:\n`pinterest [search term] - [number]`\nExample: pinterest cats - 5"
        );
      }

      const num = parseInt(count, 10) || 5;
      if (isNaN(num) || num < 1 || num > 20) {
        return send("⚠️ Number must be between 1 and 20.");
      }

      const apiUrl = `https://kaiz-apis.gleeze.com/api/pinterest?search=${encodeURIComponent(
        searchTerm
      )}`;
      const { data } = await axios.get(apiUrl);
      const list = data.data;
      if (!list || !list.length) {
        return send(`No results found for "${searchTerm}".`);
      }

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      for (let i = 0; i < Math.min(num, list.length); i++) {
        const url = list[i];
        const imgPath = path.join(cacheDir, `pinterest_${Date.now()}_${i}.jpg`);

        // download
        const res = await axios.get(url, { responseType: "stream" });
        await new Promise((resol, rej) => {
          const w = fs.createWriteStream(imgPath);
          res.data.pipe(w);
          w.on("finish", resol);
          w.on("error", rej);
        });

        // send
        await send("", fs.createReadStream(imgPath));
        await fs.unlink(imgPath);
      }
    } catch (err) {
      console.error("Pinterest error:", err);
      send(`❌ Failed to retrieve images. ${err.message || ""}`);
    }
  },
};