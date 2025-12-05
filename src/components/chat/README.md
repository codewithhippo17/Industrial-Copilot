# Chat Components

This directory contains all chat-related UI components for the OCP platform.

## Components

### ChatUIDemo.tsx
Complete chat interface demonstration with:
- **ChatHeader**: Top navigation bar with model selector, dashboard/workspace links
- **ChatSidebar**: Session history and chat management
- **MessageBubble**: Individual chat message display
- **ChatInput**: Message composition with file upload and commands
- **ChatInterface**: Full-featured chat UI with OpenCode integration

### ModelSelector.tsx
Advanced model selection component featuring:
- Provider and model browsing (Anthropic, OpenAI, Google, etc.)
- Token usage tracking and display
- Searchable model list
- Real-time config updates via OpenCode API

### CommandsPanel.tsx ✨ NEW
MCP Commands integration component:
- Fetches available commands from OpenCode API (`GET /config`)
- Displays commands organized by MCP server
- Search and filter functionality
- Command selection with detailed schema display
- Icon-based visual categorization

## OpenCode API Integration

### Config Endpoint
All components fetch configuration from OpenCode API:

```typescript
import { opcClient } from '@/lib/opencode-client';

// Get config including MCP servers and commands
const response = await opcClient.config.get();
const config = response.data;

// Access MCP servers
const mcpServers = config?.mcpServers || [];

// Access available models and providers
const providers = config?.providers || [];
```

### Commands Data Structure

```typescript
interface MCPServer {
  name: string;
  description?: string;
  commands?: MCPCommand[];
  tools?: MCPTool[];
}

interface MCPCommand {
  name: string;
  description?: string;
  schema?: {
    input?: any;
    output?: any;
  };
  category?: string;
  icon?: string;
}
```

## Usage Examples

### CommandsPanel Integration

```tsx
import { CommandsPanel } from '@/components/chat/CommandsPanel';

function MyChat() {
  const handleCommandSelect = (command, serverName) => {
    console.log('Selected:', command.name, 'from', serverName);
    // Execute command or insert into chat input
  };

  return (
    <div className="h-screen">
      <CommandsPanel onCommandSelect={handleCommandSelect} />
    </div>
  );
}
```

### ModelSelector Integration

```tsx
import { ModelSelector } from '@/components/chat/ModelSelector';

function MyChatHeader() {
  const [currentModel, setCurrentModel] = useState();
  
  return (
    <ModelSelector
      currentModel={currentModel}
      tokensUsed={1250}
      tokensLimit={100000}
      onModelChange={setCurrentModel}
    />
  );
}
```

## Testing

Test pages available at:
- `/test/chat` - Full chat interface demo
- `/test/commands` - Commands panel standalone test ✨ NEW
- `/test/model-selector` - Model selector standalone test

## Architecture

All chat components follow these principles:
- **Client-side rendering** with `'use client'` directive
- **OpenCode SDK integration** via `@opencode-ai/sdk/client`
- **Type-safe** with TypeScript interfaces from `@/types/opencode`
- **Responsive design** with Tailwind CSS
- **Icon system** using custom Icon component from `@/components/ui`

## Future Enhancements

- [ ] Command execution integration with chat
- [ ] Command history and favorites
- [ ] Command parameter input UI
- [ ] Real-time command results streaming
- [ ] Command suggestions based on context
