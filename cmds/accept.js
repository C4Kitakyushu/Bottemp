const moment = require("moment-timezone");

module.exports = {
  name: "accept",
  usage: "accept or accept check <UID>",
  description: "Approve friend requests on the bot.",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;

    const approveRequest = async (targetUID) => {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
        doc_id: "3147613905362928",
        variables: JSON.stringify({
          input: {
            source: "friends_tab",
            actor_id: api.getCurrentUserID(),
            friend_requester_id: targetUID,
            client_mutation_id: Math.floor(Math.random() * 20).toString(),
          },
          scale: 3,
          refresh_num: 0,
        }),
      };

      try {
        const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        const json = JSON.parse(res);
        if (json.errors) return false;
        return true;
      } catch (err) {
        console.error("Approval error:", err);
        return false;
      }
    };

    if (args[0] === "check" && args[1]) {
      const uid = args[1];
      if (isNaN(uid)) {
        return api.sendMessage("⚠️ Invalid UID. Usage: accept check <UID>", threadID, messageID);
      }

      const result = await approveRequest(uid);
      const status = result ? "✅ Approved" : "❌ Failed to approve";
      return api.sendMessage(`${status} friend request for UID: ${uid}`, threadID, messageID);
    }

    // Default: show friend requests
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } }),
    };

    try {
      const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const list = JSON.parse(res).data.viewer.friending_possibilities.edges;

      if (!list.length) {
        return api.sendMessage("📭 No pending friend requests found.", threadID, messageID);
      }

      let msg = "📥 Friend Requests:\n";
      list.forEach((user, index) => {
        msg += `\n${index + 1}. Name: ${user.node.name}` +
               `\nID: ${user.node.id}` +
               `\nURL: ${user.node.url.replace("www.facebook", "fb")}` +
               `\nTime: ${moment(user.time * 1000).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}\n`;
      });

      msg += "\n➡️ To approve: accept check <UID>";
      return api.sendMessage(msg, threadID, messageID);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
      return api.sendMessage("❌ Failed to fetch friend requests.", threadID, messageID);
    }
  },
};
