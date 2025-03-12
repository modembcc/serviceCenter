from flask import Flask, request, jsonify
from groq import Groq
import os
from dotenv import load_dotenv  # Import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=".env")

app = Flask(__name__)

# Set your Groq API key
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))  # Fetch API key from environment

# Function to generate tags and summary using Groq
def generate_tags_and_summary(message):
    try:
        # Call the Groq API
        response = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",  # Use a Groq-supported model
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that generates tags and a summary for a given message. "
                               "The tags must include at least one tag related to the urgency of the message. "
                               "The urgency tags must be either 'urgent' or 'low_urgency'. "
                               "Respond in the following format:\n\nTags: tag1, tag2, tag3\nSummary: A brief summary of the message."
                },
                {
                    "role": "user",
                    "content": f"Generate 2-3 tags (including at least one urgency-related tag: 'urgent' or 'low_urgency') and a brief summary for the following message: '{message}'"
                }
            ],
            max_tokens=100,  # Limit the response length
        )

        # Extract the generated content
        generated_text = response.choices[0].message.content.strip()

        # Parse the generated text into tags and summary
        lines = generated_text.split("\n")
        tags = []
        summary = ""
        for line in lines:
            if line.lower().startswith("tags:"):
                # Remove single quotes from tags
                tags = [tag.strip().replace("'", "") for tag in line.replace("Tags:", "").split(",")]
            elif line.lower().startswith("summary:"):
                summary = line.replace("Summary:", "").strip()

        # Validate that at least one urgency-related tag is present
        urgency_tags = {"urgent", "low_urgency"}
        if not any(tag.lower() in urgency_tags for tag in tags):
            tags.append("low_urgency")  # Default urgency tag if none is found

        return tags, summary

    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return None, None

@app.route('/', methods=['POST'])
def handle_message():
    payload = request.json
    message = payload.get('message')
    print("Received message:", message)

    if not message:
        return jsonify({"error": "Message is required"}), 400

    # Generate tags and summary using Groq
    tags, summary = generate_tags_and_summary(message)

    if not tags or not summary:
        return jsonify({"error": "Failed to generate tags and summary"}), 500

    # Simulate a response with tags and summary
    response = {
        "tags": tags,
        "summary": summary
    }
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)