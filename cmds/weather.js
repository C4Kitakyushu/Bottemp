const axios = require("axios");

module.exports = {
  name: "weather",
  aliases: ["forecast"],
  usage: "weather <location>",
  description: "Get current weather information for a location.",
  version: "1.0.0",

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args || args.length === 0) {
      return send("⚠️ Please provide a location.\n\nExample: weather Tokyo");
    }

    const location = args.join(" ");
    const apiUrl = `https://kaiz-apis.gleeze.com/api/weather?q=${encodeURIComponent(location)}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data["0"];

      if (!data || !data.location || !data.current) {
        return send("❌ Could not fetch weather info. Please try a different location.");
      }

      const {
        location: loc,
        current: {
          temperature,
          skytext,
          humidity,
          winddisplay,
          feelslike,
          date,
          observationtime,
          observationpoint,
        },
      } = data;

      const msg = `
📍 Location: ${loc.name}
🌡️ Temperature: ${temperature}°C
⛅ Sky: ${skytext}
💧 Humidity: ${humidity}%
🌬️ Wind: ${winddisplay}
🌡️ Feels Like: ${feelslike}°C
📅 Date: ${date}
⏰ Time: ${observationtime}
📌 Observation Point: ${observationpoint}
      `.trim();

      send(msg);
    } catch (error) {
      console.error("Weather API Error:", error);
      send("❌ Error retrieving weather data. Please try again later.");
    }
  },
};