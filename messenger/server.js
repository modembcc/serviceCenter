require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Facebook webhook verification token
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Endpoint for Facebook webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Check if the mode and token are correct
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    console.error("Webhook verification failed");
    res.sendStatus(403);
  }
});

// Endpoint to receive event notifications
app.post("/webhook", (req, res) => {
  const body = req.body;

  // Check if this is a page subscription event
  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0];
      console.log("Received event:", webhookEvent);

      // Handle the event (e.g., message, postback, etc.)
      handleEvent(webhookEvent);
    });

    // Return a 200 OK response to acknowledge receipt of the event
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a 404 if the event is not from a page subscription
    res.sendStatus(404);
  }
});

// Function to handle different types of events
function handleEvent(event) {
  if (event.message) {
    console.log("Received message:", event.message);
    // Handle message event
  } else if (event.postback) {
    console.log("Received postback:", event.postback);
    // Handle postback event
  } else {
    console.log("Unhandled event type:", event);
  }
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MessengerService is running on port ${PORT}`);
});
