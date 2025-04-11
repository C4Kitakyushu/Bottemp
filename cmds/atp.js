const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "atp",
  version: "1.0.0",
  description: "none.",
  usage: "none.",

  handleEvent: async function ({ api }) {
    const validImageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    let isPosting = false;

    const downloadImage = async (url) => {
      const imagePath = path.join(__dirname, "dog.jpg");

      const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
      });

      return new Promise((resolve, reject) => {
        const stream = response.data.pipe(fs.createWriteStream(imagePath));
        stream.on("finish", () => resolve(imagePath));
        stream.on("error", (err) => reject(err));
      });
    };

    const postImage = async () => {
      if (isPosting) return;
      isPosting = true;

      try {
        let imageUrl;
        let attempts = 0;

        do {
          const res = await axios.get("https://rest-api.joshuaapostol.site/random-dog-image");
          imageUrl = res.data.url;
          attempts++;
        } while (!validImageExtensions.some(ext => imageUrl.endsWith(ext)) && attempts < 5);

        if (!validImageExtensions.some(ext => imageUrl.endsWith(ext))) {
          throw new Error("No valid image found after several attempts.");
        }

        const imagePath = await downloadImage(imageUrl);

        await api.createPost({
          attachment: fs.createReadStream(imagePath),
          visibility: "Everyone",
        });

        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error("AutoPost Error:", err.message);
      } finally {
        isPosting = false;
      }
    };

    // Auto run every 40 minutes
    setInterval(() => {
      postImage();
    }, 40 * 60 * 1000);
  },
};