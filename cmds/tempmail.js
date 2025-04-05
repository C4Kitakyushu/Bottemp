const fs = require("fs");
const axios = require("axios");
const configPath = "./config.json";

module.exports = {
  name: "tempmail",
  usePrefix: false,
  usage: "tempmail gen | tempmail inbox <token>",
  version: "1.0",
  description: "Generate a temporary email address or fetch inbox messages",

  execute: async ({ api, event }) => {
    const { threadID: senderId, messageID: messageID } = event;
    const { args } = event; // assuming you parse args into event.args

    if (!args[0]) {
      return api.sendMessage(
        { body: "❗ Usage: `tempmail gen` or `tempmail inbox <token>`." },
        senderId,
        messageID
      );
    }

    const subcommand = args[0].toLowerCase();

    // GENERATE TEMPMAIL
    if (subcommand === "gen") {
      try {
        const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/tempmail-create");

        if (!data?.token || !data?.address) {
          return api.sendMessage(
            { body: "⚠️ Failed to generate email. Please try again later." },
            senderId,
            messageID
          );
        }

        api.sendMessage(
          {
            body:
              `📧 Generated Email: ${data.address}\n\n` +
              `🔑 COPY YOUR TOKEN:\n${data.token}\n\n` +
              `Check inbox with:\n` +
              `tempmail inbox ${data.token}`
          },
          senderId,
          messageID
        );
      } catch (err) {
        console.error("Error generating email:", err);
        api.sendMessage(
          { body: "⚠️ An error occurred while generating the email." },
          senderId,
          messageID
        );
      }

    // FETCH INBOX
    } else if (subcommand === "inbox" && args[1]) {
      const token = args[1];
      try {
        const { data } = await axios.get(
          `https://kaiz-apis.gleeze.com/api/tempmail-inbox?token=${token}`
        );
        const inbox = data.emails || [];

        if (inbox.length === 0) {
          api.sendMessage(
            { body: "📭 No messages found in your inbox." },
            senderId,
            messageID
          );
        } else {
          const mail = inbox[0];
          api.sendMessage(
            {
              body:
                `🛡️ TOKEN VERIFIED ✅\n\n` +
                `📩 From: ${mail.from || "Unknown"}\n` +
                `🔖 Subject: ${mail.subject || "No Subject"}\n` +
                `📅 Date: ${mail.date || "Unknown Date"}\n\n` +
                `━━━━━━━━━━━━━━━━\n` +
                `${mail.body || "No content available."}`
            },
            senderId,
            messageID
          );
        }
      } catch (err) {
        console.error("Error fetching inbox:", err);
        api.sendMessage(
          { body: "⚠️ An error occurred while fetching the inbox." },
          senderId,
          messageID
        );
      }

    // INVALID USAGE
    } else {
      api.sendMessage(
        { body: "❗ Usage: `tempmail gen` or `tempmail inbox <token>`." },
        senderId,
        messageID
      );
    }
  }
};