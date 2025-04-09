const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  name: "fbdl",
  aliases: ["fbdl"],
  usage: "fbdownload <facebook_video_url>",
  description: "Download a video from Facebook using the provided URL.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    // Validate input
    if (args.length === 0) {
      return send("❌ Please provide a Facebook video URL.\n\nExample:\nfbdownload https://www.facebook.com/watch/?v=1234567890");
    }

    const videoUrl = args[0];
    const apiUrl = `https://kaiz-apis.gleeze.com/api/fbdl-v2?url=${encodeURIComponent(videoUrl)}`;

    try {
      send("⏳ Fetching video, please wait...");

      // Fetch video download link from the API
      const response = await axios.get(apiUrl);
      const { success, hd, sd } = response.data;

      if (!success) {
        return send("❌ Failed to retrieve the video. Please check the URL and try again.");
      }

      // Determine the best available quality
      const downloadUrl = hd || sd;
      if (!downloadUrl) {
        return send("❌ No downloadable video found at the provided URL.");
      }

      // Define the path to save the video
      const videoPath = path.join(__dirname, "cache", `fbvideo_${Date.now()}.mp4`);

      // Ensure the cache directory exists
      await fs.ensureDir(path.dirname(videoPath));

      // Download the video
      const videoResponse = await axios.get(downloadUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(videoPath);
      videoResponse.data.pipe(writer);

      writer.on("finish", async () => {
        // Send the video file
        await api.sendMessage(
          {
            body: "🎬 Here's your downloaded Facebook video:",
            attachment: fs.createReadStream(videoPath),
          },
          threadID,
          () => fs.unlinkSync(videoPath), // Delete the file after sending
          messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        send("❌ Failed to save the video.");
      });

    } catch (error) {
      console.error("Error fetching video:", error);
      send("❌ An error occurred while processing the video. Please try again.");
    }
  },
};