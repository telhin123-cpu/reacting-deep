# 1.0.0 - Reacting Deep (Chat Only Version)
## New Features
- **AI Chat Assistant** with beautiful interface in Sidebar Controls
- **Role-based access control** for chat button (GAMEMASTER, ASSISTANT, PLAYER)
- **Updated design** with gradient buttons and modern UI
- **Simplified module** - removed all translation functionality

## Removed Features
- **Translation functionality** completely removed
- **Gemini integration** removed (was already removed in previous version)
- **Item/Spell/Journal translation buttons** removed
- **Language and system settings** removed
- **Prompt template support** removed

## Technical Changes
- Removed: data-handler.ts, html-handler.ts (translation handlers)
- Removed: Translation-related types and enums
- Simplified: translator.ts - only chat functionality remains
- Simplified: main.ts - only chat initialization
- Updated: All configuration files for chat-only module

## Settings Changes
- Removed: Target System, Target Language, Prompt Template Path
- Kept: DeepSeek API Key, API Endpoint, Model, Chat Button Roles
- Focus: Pure chat assistant functionality

# 1.0.11 (Previous Version - with translation)
- Rollable table & names

# 1.0.1 (Previous Version - with translation)
- Kick off