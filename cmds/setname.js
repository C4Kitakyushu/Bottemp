module.exports = {
  name: "setname",
  aliases: ["nickname", "nick"],
  usage: "setname <new name> | [@mention]",
  description: "Change your nickname or someone else's in the group.",
  version: "1.0.1",

  execute: async ({ api, event, args }) => {
    const { threadID, senderID, mentions, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args[0]) {
      return send("⚠️ Please enter a new nickname.");
    }

    const mentionIDs = Object.keys(mentions);
    const fullInput = args.join(" ");

    // If no one is tagged, change the nickname of the sender
    if (mentionIDs.length === 0) {
      try {
        await api.changeNickname(fullInput, threadID, senderID);
        return send("✅ Your nickname has been updated.");
      } catch (err) {
        return send("❌ Failed to update your nickname.");
      }
    }

    // If someone is tagged, change their nickname
    const targetID = mentionIDs[0];
    const nickname = fullInput.replace(mentions[targetID], "").trim() || " ";

    try {
      await api.changeNickname(nickname, threadID, targetID);
      return send(`✅ Nickname updated for the mentioned user.`);
    } catch (err) {
      return send("❌ Failed to update nickname for the tagged user.");
    }
  }
};