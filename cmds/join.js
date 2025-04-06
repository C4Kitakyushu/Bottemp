const axios = require("axios");

module.exports = {
  name: "join",
  aliases: [],
  usage: "join [threadID]",
  description: "Join the specified group chat or view list of joinable groups",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, senderID } = event;
    const send = (msg) => api.sendMessage(msg, threadID);

    try {
      if (!args[0]) {
        const groupList = await api.getThreadList(10, null, ["INBOX"]);
        const filtered = groupList.filter(g => g.isGroup && g.threadName);

        if (!filtered.length) return send("❌ No group chats found.");

        const list = filtered.map((g, i) => 
          `│${i + 1}. ${g.threadName}\n│TID: ${g.threadID}\n│Members: ${g.participantIDs.length}\n│`
        ).join("\n");

        const msg = `╭─╮\n│ Group Chats:\n${list}\n╰────────────ꔪ\nMax Members: 250\n\nTo join, reply:\njoin <threadID>\nExample: join 1234567890`;
        return send(msg);
      }

      const targetThread = args[0];
      const info = await api.getThreadInfo(targetThread);

      if (!info) return send("❌ Invalid thread ID provided.");

      if (info.participantIDs.includes(senderID))
        return send(`⚠️ You're already a member of: ${info.threadName}`);

      if (info.participantIDs.length >= 250)
        return send(`❌ Group is full: ${info.threadName}`);

      await api.addUserToGroup(senderID, targetThread);
      return send(`✅ You have joined: ${info.threadName}`);
    } catch (err) {
      console.error("Join command error:", err);
      return send("❌ An error occurred. Please try again later.");
    }
  }
};