const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Facebook webhook verification token
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Endpoint for Facebook webhook verification
app.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Received verification request:", { mode, token, challenge });

  // Check if the mode and token are correct
  if (mode.trim() === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    console.error("Webhook verification failed");
    res.sendStatus(403);
  }
});

// Endpoint to receive event notifications
app.post("/", (req, res) => {
  const body = req.body;
  console.log(body);

  // Check if this is a valid event
  if (body.field === "messages") {
    console.log("Received message event:", body.value);

    // Handle the event
    handleEvent(body.value);

    // Return a 200 OK response to acknowledge receipt of the event
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a 404 if the event is not recognized
    res.sendStatus(404);
  }
});

// Function to handle the event
function handleEvent(event) {
  const { sender, recipient, timestamp, message } = event;

  console.log("Sender ID:", sender.id);
  console.log("Recipient ID:", recipient.id);
  console.log("Timestamp:", timestamp);
  console.log("Message:", message.text);

  // Process commands if they exist
  if (message.commands && message.commands.length > 0) {
    message.commands.forEach((command, index) => {
      console.log(`Command ${index + 1}:`, command.name);
    });
  } else {
    console.log("No commands found in the message.");
  }
}

// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`MessengerService is running on port ${PORT}`);
});

module.exports = app;
