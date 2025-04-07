const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  name: 'art',
  description: 'Generate art based on a prompt.',
  usage: 'art <prompt>',
  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const prompt = args.join(' ');

    if (!prompt) {
      return api.sendMessage('❌ Please provide a prompt for the art generation.', threadID, messageID);
    }

    const apiUrl = `https://elevnnnx-rest-api.onrender.com/api/art?prompt=${encodeURIComponent(prompt)}`;
    const imagePath = path.join(__dirname, 'cache', `art_${Date.now()}.png`);

    try {
      // Notify the user that the art generation is in progress
      api.sendMessage('⏳ Generating art, please wait...', threadID, messageID);

      // Ensure the cache directory exists
      await fs.ensureDir(path.dirname(imagePath));

      // Fetch the generated art image from the API
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      // Save the image to the cache directory
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        // Send the image as an attachment
        await api.sendMessage({
          attachment: fs.createReadStream(imagePath),
        }, threadID, () => fs.unlinkSync(imagePath), messageID);
      });

      writer.on('error', (err) => {
        console.error('Error writing image file:', err);
        api.sendMessage('❌ Failed to process the generated art.', threadID, messageID);
      });
    } catch (error) {
      console.error('Error generating art:', error);
      api.sendMessage('❌ An error occurred while generating the art. Please try again later.', threadID, messageID);
    }
  },
};