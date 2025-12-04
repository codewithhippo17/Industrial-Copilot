# **⚛️ REACT CHAT COMPONENTS - CLAUDE-INSPIRED ARCHITECTURE**

*OCP LLM-Powered Dashboard - Component Implementation Plan*  
*December 4, 2025*

---

## **🎯 COMPONENT HIERARCHY OVERVIEW**

Based on our Claude-inspired design specification, here's the complete React component architecture for the chat interface:

```
ChatInterface (Main Container)
├── ChatHeader (Agent/Model Selection)
├── ChatLayout (Two-Column Layout)
│   ├── ChatSidebar (Conversation History)
│   │   ├── ConversationList
│   │   ├── ConversationItem
│   │   └── ConversationSearch
│   └── ChatMainArea (Conversation + Input)
│       ├── ConversationArea
│       │   ├── MessageList (Virtualized)
│       │   ├── Message (User/Assistant)
│       │   ├── ArtifactContainer
│       │   │   ├── ChartArtifact
│       │   │   ├── MLResultsArtifact
│       │   │   └── CodeArtifact
│       │   └── TypingIndicator
│       └── InputComposer
│           ├── MessageInput (Auto-expanding)
│           ├── AttachmentButton
│           ├── ContextualSuggestions
│           └── SendButton
```

---

## **🏗️ COMPONENT SPECIFICATIONS**

### **1. ChatInterface (Root Container)**

**File:** `/src/app/chat/page.tsx` (Next.js App Router)
**Purpose:** Main chat page with layout and state management

```typescript
interface ChatInterfaceProps {
  initialSessionId?: string;
  dashboardContext?: DashboardContext;
  workspaceContext?: WorkspaceContext;
}

interface ChatState {
  currentSession: ChatSession;
  messages: Message[];
  currentAgent: Agent;
  currentModel: LLMModel;
  isLoading: boolean;
  isTyping: boolean;
}
```

**Key Responsibilities:**
- WebSocket connection management
- Global chat state management
- Route-level data fetching
- Context awareness (dashboard/workspace)
- Real-time message streaming

---

### **2. ChatHeader (Agent & Model Controls)**

**File:** `/src/components/chat/ChatHeader.tsx`
**Purpose:** Clean header bar with agent and model selection

```typescript
interface ChatHeaderProps {
  currentAgent: Agent;
  currentModel: LLMModel;
  availableAgents: Agent[];
  availableModels: LLMModel[];
  onAgentChange: (agent: Agent) => void;
  onModelChange: (model: LLMModel) => void;
  onSettingsClick: () => void;
}
```

**Design Features:**
- **Minimal header bar** like Claude
- **Agent dropdown** with descriptions and switching
- **Model selector** with configuration access
- **Settings gear** for advanced options
- **Breadcrumb context** showing current dashboard/workspace

**Styling:**
```scss
.chat-header {
  height: 60px;
  border-bottom: 1px solid #e1e5e9;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}
```

---

### **3. ChatLayout (Two-Column Container)**

**File:** `/src/components/chat/ChatLayout.tsx`  
**Purpose:** Responsive layout container managing sidebar and main area

```typescript
interface ChatLayoutProps {
  sidebar: React.ReactNode;
  mainArea: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle: () => void;
}
```

**Responsive Behavior:**
- **Desktop (1200px+):** Fixed sidebar (240px) + flexible chat area
- **Tablet (768-1199px):** Collapsible sidebar overlay
- **Mobile (320-767px):** Hidden sidebar accessible via hamburger

**Key Features:**
- **Smooth transitions** for sidebar collapse
- **Touch gestures** on mobile for sidebar
- **Keyboard shortcuts** (Cmd+K for sidebar toggle)
- **Persistent sidebar state** per user preference

---

### **4. ChatSidebar (Conversation History)**

**File:** `/src/components/chat/ChatSidebar.tsx`
**Purpose:** Clean conversation history like Claude's interface

```typescript
interface ChatSidebarProps {
  conversations: ConversationSummary[];
  currentConversationId: string;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  isCollapsed?: boolean;
}

interface ConversationSummary {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  context: 'dashboard' | 'workspace' | 'global';
}
```

**Design Elements:**
- **"+ New Chat" button** prominently at top
- **Chronological grouping** (Today, Yesterday, This Week)
- **Search functionality** for finding conversations
- **Context indicators** (dashboard icon, workspace icon)
- **Clean typography** with subtle meta information

#### **SubComponent: ConversationList**
```typescript
interface ConversationListProps {
  conversations: ConversationSummary[];
  groupBy: 'date' | 'context' | 'none';
  currentId: string;
  onSelect: (id: string) => void;
}
```

#### **SubComponent: ConversationItem**
```typescript
interface ConversationItemProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onRename?: (newTitle: string) => void;
}
```

---

### **5. ConversationArea (Message Display)**

**File:** `/src/components/chat/ConversationArea.tsx`
**Purpose:** Clean message flow without bubbles, like Claude

```typescript
interface ConversationAreaProps {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  onRetry?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  artifacts?: Artifact[];
  metadata?: MessageMetadata;
}
```

**Key Features:**
- **No message bubbles** - clean text flow
- **Virtualized scrolling** for performance with long conversations
- **Smooth animations** for new messages
- **Artifact embedding** for charts, ML results, code
- **Message actions** (copy, retry, edit) on hover

---

### **6. ArtifactContainer (Rich Content Display)**

**File:** `/src/components/chat/artifacts/ArtifactContainer.tsx`
**Purpose:** Claude-style expandable content blocks for charts/ML results

```typescript
interface ArtifactContainerProps {
  artifacts: Artifact[];
  onExpand?: (artifactId: string) => void;
  onAction?: (artifactId: string, action: ArtifactAction) => void;
}

interface Artifact {
  id: string;
  type: 'chart' | 'ml-results' | 'code' | 'table';
  title: string;
  content: any;
  actions: ArtifactAction[];
  metadata: ArtifactMetadata;
}

type ArtifactAction = 
  | 'expand' | 'open-dashboard' | 'share' | 'export' 
  | 'copy' | 'edit' | 'run' | 'download';
```

#### **SubComponent: ChartArtifact**
```typescript
interface ChartArtifactProps {
  chartData: PlotlyData;
  chartConfig: PlotlyConfig;
  title: string;
  onSaveToDashboard: (tabId: string, slotId: string) => void;
  onShare: () => void;
  onExport: (format: 'png' | 'pdf' | 'json') => void;
}
```

**Design:**
- **Card-like container** with subtle border
- **Expandable content** - click to view full screen
- **Action buttons** at bottom (Save, Share, Export, etc.)
- **Responsive sizing** that adapts to chart complexity

#### **SubComponent: MLResultsArtifact**
```typescript
interface MLResultsArtifactProps {
  results: MLModelResults;
  recommendations: Recommendation[];
  onApplyRecommendation: (id: string) => void;
  onGenerateChart: (metric: string) => void;
  onDownloadReport: () => void;
}
```

#### **SubComponent: CodeArtifact**
```typescript
interface CodeArtifactProps {
  code: string;
  language: string;
  output?: string;
  onCopy: () => void;
  onRun?: () => void;
  onEdit?: (newCode: string) => void;
}
```

---

### **7. InputComposer (Message Input)**

**File:** `/src/components/chat/InputComposer.tsx`
**Purpose:** Clean, expandable input area like Claude

```typescript
interface InputComposerProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  isLoading: boolean;
  maxHeight?: number;
  placeholder?: string;
  suggestionsEnabled?: boolean;
}
```

**Key Features:**
- **Auto-expanding textarea** as user types
- **Drag & drop file support** anywhere in the input area
- **Send on Enter** with Shift+Enter for new lines  
- **Contextual suggestions** that appear above input
- **Command detection** - typing "/" shows available commands
- **Voice input** button (mobile-first)

**Design:**
```scss
.input-composer {
  border-top: 1px solid #e1e5e9;
  background: white;
  padding: 16px 24px;
  
  .input-area {
    border: 1px solid #d1d5db;
    border-radius: 12px;
    min-height: 44px;
    max-height: 200px;
    resize: none;
    
    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
}
```

#### **SubComponent: ContextualSuggestions**
```typescript
interface ContextualSuggestionsProps {
  suggestions: Suggestion[];
  onSelectSuggestion: (suggestion: Suggestion) => void;
  visible: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  description?: string;
  category: 'command' | 'query' | 'action';
  icon?: string;
}
```

---

### **8. Real-Time Features**

#### **TypingIndicator Component**
```typescript
interface TypingIndicatorProps {
  isVisible: boolean;
  message?: string; // "Analyzing data...", "Creating chart..."
}
```

#### **WebSocket Hook**
```typescript
interface UseWebSocketResult {
  isConnected: boolean;
  sendMessage: (message: string) => void;
  messages: Message[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

// Custom hook for WebSocket management
const useWebSocket = (sessionId: string): UseWebSocketResult;
```

#### **Stream Response Hook**
```typescript
interface UseStreamResponseResult {
  streamingContent: string;
  isStreaming: boolean;
  completeMessage?: Message;
}

// Custom hook for handling streaming AI responses
const useStreamResponse = (messageId: string): UseStreamResponseResult;
```

---

## **🎨 STYLING ARCHITECTURE**

### **Tailwind Configuration**
```javascript
// tailwind.config.js - Claude-inspired theme
module.exports = {
  theme: {
    extend: {
      colors: {
        // Claude-inspired color palette
        chat: {
          bg: '#ffffff',
          sidebar: '#f8f9fa',
          border: '#e1e5e9',
          'border-light': '#f0f0f0',
          'user-text': '#2563eb',
          'assistant-text': '#1f2937',
          'artifact-bg': '#f8fafc',
          'artifact-border': '#e2e8f0',
        },
        text: {
          primary: '#111827',
          secondary: '#6b7280',
          muted: '#9ca3af',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui'],
      },
      spacing: {
        'message': '24px',
      }
    }
  }
}
```

### **Component-Level Styling**
Each component uses Tailwind utility classes with custom CSS modules for complex interactions:

```scss
// MessageList.module.scss
.messageList {
  @apply space-y-6 p-6 overflow-y-auto;
  
  .userMessage {
    @apply text-right text-chat-user-text font-medium mb-message;
  }
  
  .assistantMessage {
    @apply text-left text-chat-assistant-text leading-relaxed mb-message;
  }
}
```

---

## **⚡ STATE MANAGEMENT**

### **Global Chat State (Zustand)**
```typescript
interface ChatStore {
  // Session Management
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  
  // Messages
  messages: Message[];
  streamingMessage: Partial<Message> | null;
  
  // UI State
  sidebarCollapsed: boolean;
  currentAgent: Agent;
  currentModel: LLMModel;
  
  // Actions
  setCurrentSession: (session: ChatSession) => void;
  addMessage: (message: Message) => void;
  updateStreamingMessage: (partial: Partial<Message>) => void;
  toggleSidebar: () => void;
  switchAgent: (agent: Agent) => void;
  switchModel: (model: LLMModel) => void;
}
```

### **Message State (React Query)**
```typescript
// React Query for server state management
const useMessages = (sessionId: string) => {
  return useQuery({
    queryKey: ['messages', sessionId],
    queryFn: () => fetchMessages(sessionId),
    staleTime: 30000, // 30 seconds
  });
};

const useSendMessage = () => {
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (message) => {
      // Update local state and trigger WebSocket
    },
  });
};
```

---

## **📱 RESPONSIVE IMPLEMENTATION**

### **Mobile-First Approach**
```typescript
// Responsive breakpoints
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1200);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};
```

### **Progressive Enhancement**
- **Mobile:** Single column, hidden sidebar, bottom input
- **Tablet:** Overlay sidebar, touch-optimized interactions
- **Desktop:** Full two-column layout, hover states, keyboard shortcuts

---

## **🔧 INTEGRATION POINTS**

### **Database Integration**
```typescript
// API endpoints matching database schema
interface ChatAPI {
  // Sessions
  getSessions: () => Promise<ChatSession[]>;
  createSession: (context: SessionContext) => Promise<ChatSession>;
  updateSession: (id: string, updates: Partial<ChatSession>) => Promise<void>;
  
  // Messages
  getMessages: (sessionId: string) => Promise<Message[]>;
  saveMessage: (message: Message) => Promise<void>;
  
  // Agents & Models
  getAgents: () => Promise<Agent[]>;
  getModels: () => Promise<LLMModel[]>;
  
  // Artifacts
  saveArtifact: (artifact: Artifact) => Promise<void>;
  getArtifacts: (sessionId: string) => Promise<Artifact[]>;
}
```

### **Dashboard Integration**
```typescript
interface DashboardIntegration {
  addChartToDashboard: (chartId: string, tabId: string, slotId: string) => Promise<void>;
  getCurrentDashboard: () => Promise<Dashboard>;
  createDashboardFromChat: (sessionId: string) => Promise<Dashboard>;
}
```

### **WebSocket Events**
```typescript
interface WebSocketEvents {
  // Outgoing
  'chat:message': { sessionId: string, content: string };
  'chat:typing': { sessionId: string };
  
  // Incoming  
  'message:streaming': { sessionId: string, partial: string };
  'message:complete': { sessionId: string, message: Message };
  'artifact:created': { sessionId: string, artifact: Artifact };
  'model:started': { sessionId: string, modelType: string };
  'model:complete': { sessionId: string, results: MLResults };
}
```

---

## **🚀 IMPLEMENTATION ROADMAP**

### **Phase 1: Core Components (Week 1)**
1. **ChatInterface** root container with basic routing
2. **ChatLayout** responsive two-column setup
3. **ChatHeader** with agent/model dropdowns
4. **Basic MessageList** without artifacts

### **Phase 2: Rich Content (Week 2)**  
1. **ArtifactContainer** with chart/ML result display
2. **InputComposer** with auto-expand and suggestions
3. **ChatSidebar** with conversation history
4. **WebSocket integration** for real-time messaging

### **Phase 3: Advanced Features (Week 3)**
1. **Streaming responses** with typing indicators
2. **File upload** and multi-modal input
3. **Command system** with contextual suggestions
4. **Mobile responsive** optimizations

### **Phase 4: Polish & Integration (Week 4)**
1. **Dashboard integration** for chart creation
2. **ML model execution** and result display
3. **Performance optimization** and caching
4. **Accessibility** and keyboard navigation

---

## **📊 PERFORMANCE TARGETS**

### **Core Metrics**
- **Initial load:** < 2 seconds (chat interface ready)
- **Message send:** < 100ms (to WebSocket)
- **Artifact render:** < 500ms (chart/results display)
- **Sidebar toggle:** < 200ms (smooth animation)

### **Optimization Strategies**
- **Virtualized scrolling** for message lists
- **Lazy loading** of artifacts and old messages
- **Image optimization** for chart exports
- **Bundle splitting** for chart libraries

---

## **🔒 SECURITY CONSIDERATIONS**

### **Input Sanitization**
```typescript
const sanitizeUserInput = (content: string): string => {
  // Remove dangerous HTML/JS
  // Validate command syntax
  // Check for malicious patterns
};
```

### **Permission Checks**
```typescript
const canExecuteCommand = (command: string, user: User, agent: Agent): boolean => {
  // Check user permissions
  // Validate agent capabilities
  // Ensure command safety
};
```

---

## **✨ SUCCESS CRITERIA**

### **User Experience Metrics**
- **Conversation flow:** Smooth, uninterrupted chat experience
- **Response time:** < 2 seconds for most AI responses
- **Artifact quality:** Charts/results display correctly 100% of time
- **Mobile experience:** Full feature parity on mobile devices

### **Technical Metrics**  
- **Component reusability:** 90%+ shared components
- **Type safety:** 100% TypeScript coverage
- **Test coverage:** 85%+ for core chat logic
- **Bundle size:** < 500KB for chat interface

---

This comprehensive component architecture provides a solid foundation for implementing our Claude-inspired chat interface. Each component is designed to be modular, reusable, and maintainable while delivering the elegant user experience defined in our specification.