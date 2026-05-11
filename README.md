# Reacting Deep - DeepSeek AI Chat for Foundry VTT

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/telhin123-cpu/reacting-deep?style=for-the-badge)
![Total downloads](https://img.shields.io/github/downloads/telhin123-cpu/reacting-deep/total?style=for-the-badge)

A FoundryVTT module that adds **DeepSeek AI Chat Assistant** directly to your game interface.

---

## Features

### 💬 AI Chat Assistant
- Beautiful gradient button in Sidebar Controls
- Interactive chat interface with message history
- Real-time responses from DeepSeek AI
- Role-based access control (GM, Assistant, Player)
- Modern, responsive design

### ⚙️ Configuration
- DeepSeek API key setup
- Model selection (DeepSeek Chat, DeepSeek Reasoner)
- Role-based button visibility
- Simple and clean settings

### 🎮 Game Integration
- Direct access from Sidebar Controls
- Perfect for game masters and players
- Ask rules questions, get story ideas, generate content
- No need to leave Foundry VTT

---

## Setup Instructions

1. **Get DeepSeek API Key:**
   - Visit [DeepSeek Platform](https://platform.deepseek.com/)
   - Sign up or log in to your account
   - Navigate to API Keys section
   - Create a new API key
   - ⚠️ **Important:** Store your API key securely and monitor usage

2. **Install the Module:**
   - Install via Foundry VTT module manager using manifest URL
   - Or download from GitHub releases

3. **Configure Settings:**
   - Enter your DeepSeek API key in module settings
   - Configure which roles can access the chat button
   - Choose DeepSeek model (Chat or Reasoner)

4. **Start Using:**
   - Chat button appears in Sidebar Controls for authorized users
   - Click to open the chat interface
   - Start chatting with DeepSeek AI

---

## Module Settings

| Setting | Description | Default |
|---|---|---|
| DeepSeek API Key | Your DeepSeek API key | (empty) |
| API Endpoint | DeepSeek API base URL | `https://api.deepseek.com` |
| AI Model | DeepSeek model to use | DeepSeek Chat V3 |
| Chat Button Roles | Comma-separated roles with access | GAMEMASTER,ASSISTANT |

### Available Models

- `deepseek-chat` — DeepSeek Chat V3 ($0.07 / $0.27 / $1.10 per 1M tokens)
- `deepseek-reasoner` — DeepSeek Reasoner R1 ($0.14 / $0.55 / $2.19 per 1M tokens)

---

## How It Works

### AI Chat Assistant
A beautiful gradient button appears in Sidebar Controls for authorized users:
```
[🤖 Chat with DeepSeek]
```

Click to open the chat interface:
- Ask rules questions
- Get story ideas
- Generate NPC descriptions
- Create item/spell descriptions
- Get game master assistance
- Brainstorm plot ideas
- Solve rules disputes

---

## Role-Based Access

Configure which roles can see the chat button in settings:
- `GAMEMASTER` — Game Master only
- `ASSISTANT` — Assistant GMs
- `PLAYER` — Regular players
- Combine with commas: `GAMEMASTER,ASSISTANT,PLAYER`

---

## Example Uses

**For Game Masters:**
- "Generate a mysterious NPC for my fantasy campaign"
- "Create a puzzle for a dungeon entrance"
- "Help me balance this homebrew monster"
- "Suggest plot twists for my campaign"

**For Players:**
- "Explain how grappling works in D&D 5e"
- "What are good character concepts for a rogue?"
- "Help me write my character's backstory"
- "Suggest tactics for fighting dragons"

**For Everyone:**
- "Translate this text to another language"
- "Help me understand this rule"
- "Generate random encounter ideas"
- "Create magical item descriptions"

---

## Changelog

View the full changelog [HERE](./CHANGELOG.md)

---

## Contributions

Contributions are welcome! Feature development will be based on community interest.

You can find the current to-do list [HERE](./TODO.md).
