module.exports = {
  name: "uid",
  aliases: ["userid", "getid"],
  usage: "uid [id|reply|group|all]",
  description: "Get a user or group ID",
  version: "1.0.0",
  cooldowns: 3,

  execute: async ({ api, event, args }) => {
    const { threadID, senderID, type, messageReply, participantIDs, mentions } = event;
    const send = (msg) => api.sendMessage(msg, threadID);
    let id = senderID;
    const input = args.join(" ");

    // If user supplied a Facebook profile URL
    if (input.startsWith("https://")) {
      try {
        const uid = await api.getUID(input);
        return api.shareContact(uid, uid, threadID);
      } catch {
        return send("❌ Invalid URL or unable to retrieve UID.");
      }
    }

    // If reply to a message
    if (type === "message_reply") {
      id = messageReply.senderID;
    }

    // If mention
    if (input.includes("@")) {
      const mentionIDs = Object.keys(mentions);
      if (mentionIDs.length) id = mentionIDs[0];
    }

    // List all participant IDs
    if (input.toLowerCase() === "all") {
      const list = participantIDs.map((pid, i) => `${i + 1}. ${pid}`).join("\n");
      return send(list);
    }

    // Group ID
    if (input.toLowerCase() === "group" || input === "-g") {
      return send(threadID);
    }

    // Default: share contact of resolved ID
    return api.shareContact(id, id, threadID);
  },
};