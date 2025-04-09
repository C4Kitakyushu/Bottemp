const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "fbdl",
    usePrefix: false,
    usage: "Send a Facebook video by detecting a URL",
    version: "1.0",

    execute: async ({ api, event }) => {
        const { threadID, messageID, body } = event;

        if (!body || !body.includes("facebook.com")) return;

        try {
            api.setMessageReaction("🕐", messageID, () => {}, true);

            // Fetch download info from the API
            const response = await axios.get(`https://kaiz-apis.gleeze.com/api/fbdl-v2?url=${encodeURIComponent(body)}`);
            const { success, title, hd, sd } = response.data;

            if (!success || (!hd && !sd)) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ No downloadable video found. Please check the URL.", threadID, messageID);
            }

            const videoUrl = hd || sd;
            const filePath = path.join(__dirname, "fbvideo.mp4");

            // Download the video
            const videoStream = await axios({
                url: videoUrl,
                method: "GET",
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });

            const writer = fs.createWriteStream(filePath);
            videoStream.data.pipe(writer);

            writer.on("finish", async () => {
                api.setMessageReaction("✅", messageID, () => {}, true);

                api.sendMessage({
                    body: `🎬 ${title || "Facebook Video"}`,
                    attachment: fs.createReadStream(filePath)
                }, threadID, (err) => {
                    if (err) {
                        console.error("Send error:", err);
                        return api.sendMessage("⚠️ Failed to send the video.", threadID);
                    }

                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error("File delete error:", unlinkErr);
                    });
                }, messageID);
            });

            writer.on("error", (err) => {
                console.error("Download error:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Failed to download the video.", threadID, messageID);
            });

        } catch (error) {
            console.error("API error:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ An error occurred while processing your request.", threadID, messageID);
        }
    },
};