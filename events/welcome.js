const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "event",

    async execute(api, event) {
        const { logMessageType, logMessageData, threadID } = event;

        try {
            if (logMessageType === "log:subscribe") {
                const userID = logMessageData.addedParticipants[0].userFbId;

                api.getUserInfo(userID, async (err, data) => {
                    if (err) return console.error("❌ Error fetching user info:", err);

                    let userName = data[userID]?.name || "New Member";

                    // Truncate name for aesthetics
                    const maxNameLength = 15;
                    if (userName.length > maxNameLength) {
                        userName = userName.substring(0, maxNameLength - 3) + "...";
                    }

                    // Fetch thread info
                    const threadInfo = await api.getThreadInfo(threadID);
                    const groupName = threadInfo.threadName || "this group";
                    const groupIcon = threadInfo.imageSrc || "https://i.ibb.co/G5mJZxs/rin.jpg";
                    const memberCount = threadInfo.participantIDs.length;
                    const background = threadInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg";

                    const welcomeURL = `http://87.106.100.187:6312/canvas/welcome?name=${encodeURIComponent(userName)}&groupname=${encodeURIComponent(groupName)}&groupicon=${encodeURIComponent(groupIcon)}&member=${memberCount}&uid=${userID}&background=${encodeURIComponent(background)}`;

                    try {
                        const response = await axios.get(welcomeURL, { responseType: "stream" });
                        const imagePath = path.join(__dirname, `welcome_${userID}.jpg`);
                        const writer = fs.createWriteStream(imagePath);

                        response.data.pipe(writer);
                        writer.on("finish", () => {
                            api.sendMessage(
                                {
                                    body: `👋 Everyone welcome ${userName} to ${groupName}!`,
                                    attachment: fs.createReadStream(imagePath)
                                },
                                threadID,
                                () => fs.unlinkSync(imagePath)
                            );
                        });

                        writer.on("error", (err) => {
                            console.error("❌ Image write error:", err);
                            api.sendMessage(`👋 Welcome ${userName} to ${groupName}!`, threadID);
                        });

                    } catch (error) {
                        console.error("❌ Error fetching welcome image:", error);
                        api.sendMessage(`👋 Welcome ${userName} to ${groupName}!`, threadID);
                    }
                });
            }

        } catch (err) {
            console.error("❌ Error in welcomenoti:", err);
        }
    }
};