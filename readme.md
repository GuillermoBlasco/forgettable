
# Forgettable

This is a RAG system, that provides functionality to feed data into the RAG and retrieve it.
The system is exposed via a Telegram Bot, the user can feed data with voice notes and retrieve it with text messages.

## Setup and Run

### Setup the telegram bot

Follow the steps provided in this [Official Telegram Guide](https://core.telegram.org/bots/tutorial#obtain-your-bot-token) using @BotFather to create your bot. At the end of the process you'll get a key that has to be provided in the environment.

### Setup environment

Copy the `.env.example` file to `.env`. Fill the OpenAI api key value, and the Telegram bot key (from the previous step). Qdrant example values are setup for the existing docker compose.

### Run

First start the docker compose, that starts Qdrant.
```bash
docker compose up -d
```

Then install, compile and run. Ignore the `nvm use 20` if you are already running node 20, or use your own node version manager.

```bash
nvm use 20
npm install
npm run build
npm run start
```

# Usage

Once the app is running, you can start a conversation with your bot. Start by providing a voice message, that is going to be stored. Then retrieve the message by using a text message.

So there are two actions: store and retrieve. To store use a voice message, to retrieve use a text message. Data is filtered by user id (Telegram user id), so data from one telegram user is not exposed to other telegram users.