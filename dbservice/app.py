from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage for payloads
payloads = []

# POST /new endpoint
@app.route('/new', methods=['POST'])
def new_message():
    # Get the JSON payload from the request
    payload = request.json

    # Validate the payload
    if not payload or 'message' not in payload or 'userid' not in payload or 'platform' not in payload:
        return jsonify({"error": "Invalid payload"}), 400

    # Step 1: Send the message to localhost:4000
    try:
        response = requests.post('http://localhost:4000', json={"message": payload['message']})
        response.raise_for_status()  # Raise an error for bad status codes
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to send message to localhost:4000: {str(e)}"}), 500

    # Step 2: Extract tags and summary from the response
    try:
        tags = response.json().get('tags')  # Now using 'tags' instead of 'tag'
        summary = response.json().get('summary')
        if not tags or not summary:
            return jsonify({"error": "Invalid response from localhost:4000: missing tags or summary"}), 500
    except ValueError:
        return jsonify({"error": "Invalid JSON response from localhost:4000"}), 500

    # Step 3: Modify the original payload
    modified_payload = {
        "userid": payload['userid'],
        "platform": payload['platform'],
        "tags": tags,  # Now using 'tags'
        "summary": summary
    }

    # Step 4: Store the modified payload locally
    payloads.append(modified_payload)
    print("Stored payload:", modified_payload)  # Log the stored payload

    # Respond with 200 OK
    return jsonify({"status": "success"}), 200

# GET /get endpoint
@app.route('/get', methods=['GET'])
def get_payloads():
    # Return the list of all stored payloads
    return jsonify(payloads), 200

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)