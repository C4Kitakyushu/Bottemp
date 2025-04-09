const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "fbdl",
    usePrefix: false,
    usage: "Downloads Facebook videos using Kaiz API",
    version: "1.0",

    execute: async ({ api, event }) => {
        const { threadID, messageID, body } = event;
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const foundUrls = body.match(urlRegex);

        if (!foundUrls) return;

        const videoUrl = foundUrls[0];

        // Check if it's a Facebook URL
        if (!videoUrl.includes("facebook.com")) return;

        api.sendMessage(`🔍 **Detected Facebook URL:** ${videoUrl}`, threadID, async () => {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            const apiUrl = `https://kaiz-apis.gleeze.com/api/fbdl-v2?url=${encodeURIComponent(videoUrl)}`;

            try {
                const response = await axios.get(apiUrl);

                if (!response.data || !response.data.video || !response.data.video.hd) {
                    api.setMessageReaction("❌", messageID, () => {}, true);
                    return api.sendMessage("⚠️ Could not retrieve video.", threadID, messageID);
                }

                const videoDownloadUrl = response.data.video.hd;
                const filePath = path.join(__dirname, "fb_video.mp4");

                const writer = fs.createWriteStream(filePath);
                const videoResponse = await axios({
                    url: videoDownloadUrl,
                    method: "GET",
                    responseType: "stream",
                });

                videoResponse.data.pipe(writer);

                writer.on("finish", async () => {
                    api.setMessageReaction("✅", messageID, () => {}, true);

                    const msg = {
                        body: `🎬 Here's your Facebook video!`,
                        attachment: fs.createReadStream(filePath),
                    };

                    api.sendMessage(msg, threadID, () => {
                        fs.unlink(filePath, (err) => {
                            if (err) console.error("❌ Failed to delete video:", err);
                        });
                    });
                });

                writer.on("error", (err) => {
                    console.error("❌ Download error:", err);
                    api.setMessageReaction("❌", messageID, () => {}, true);
                    api.sendMessage("⚠️ Error downloading video.", threadID, messageID);
                });

            } catch (err) {
                console.error("❌ API error:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Failed to fetch from API.", threadID, messageID);
            }
        });
    },
};