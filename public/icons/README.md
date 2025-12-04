# 🎨 Icons Directory Structure

This directory contains all icons used throughout the OCP LLM-Powered Dashboard application.

## 📁 Directory Organization

### `/ui/` - User Interface Icons
- General UI elements (hamburger menu, dropdowns, settings, etc.)
- Navigation and layout icons
- Interactive state icons (expand, collapse, close, etc.)

### `/agents/` - Agent-Related Icons  
- Different agent types (🤖 Data Analyst, 📊 Chart Creator, etc.)
- Agent status indicators
- Agent capability icons

### `/commands/` - Command Icons
- Individual command icons (`/create-chart`, `/optimize-energy`, etc.)
- Command category icons
- Command status indicators

### `/files/` - File Type Icons
- Document type icons (PDF, Excel, Word, etc.)
- Upload/download icons
- File status indicators

### `/dashboard/` - Dashboard-Specific Icons
- Chart type icons (bar, line, pie, etc.)
- Dashboard tab icons
- Workspace indicators
- Sharing and collaboration icons

## 🎯 Icon Specifications from Web Chat UI Spec

Based on the WEB_CHAT_UI_SPECIFICATION.md, these icons are needed:

### Header Bar Icons:
- ☰ Hamburger menu
- 🤖 Agent selector dropdown arrow
- 🧠 Model selector dropdown arrow  
- ⚙️ Settings gear

### Context Bar Icons:
- 📁 Files dropdown
- 📋 Commands dropdown
- 📊 Dashboard tab selector
- 🗂️ Workspace selector
- ▼ Dropdown arrows for all selectors

### Conversation Icons:
- 💬 Message input
- 📎 File attachment
- Send button arrow
- New chat plus icon (+)

## 📐 Design Guidelines

- **Format:** SVG preferred for scalability
- **Size:** 16x16, 20x20, 24x24 pixel variants
- **Style:** Clean, minimal, consistent with OCP dashboard aesthetic
- **Color:** Adaptable to light/dark themes
- **Naming:** Descriptive, kebab-case (e.g., `hamburger-menu.svg`)

## 🔗 Usage in Components

Icons should be imported and used through a centralized icon component system:

```tsx
import { Icon } from '@/components/ui/Icon'

<Icon name="hamburger-menu" size={20} />
<Icon name="agent-data-analyst" size={16} />
<Icon name="command-create-chart" size={24} />
```