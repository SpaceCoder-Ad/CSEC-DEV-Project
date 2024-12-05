const { SessionsClient } = require("@google-cloud/dialogflow");
const sessionClient = new SessionsClient();

async function generateResponse(userInput, sessionId) {
  const sessionPath = sessionClient.projectAgentSessionPath(
    "your-project-id", // Replace with your Google Cloud project ID
    sessionId,
  );
  c;
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userInput,
        languageCode: "en",
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult.fulfillmentText;
}

module.exports = { generateResponse };
