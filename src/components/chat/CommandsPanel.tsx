'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui';
import { opcClient } from '@/lib/opencode-client';
import type { MCPServer, MCPCommand, CommandExecutionRequest } from '@/types/opencode';

interface CommandsPanelProps {
  onCommandSelect?: (command: MCPCommand, server: string) => void;
  className?: string;
}

/**
 * CommandsPanel Component
 * Fetches MCP servers and commands from OpenCode API config endpoint
 * Displays available commands organized by MCP server
 */
export const CommandsPanel: React.FC<CommandsPanelProps> = ({ 
  onCommandSelect,
  className = '' 
}) => {
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch MCP servers and commands from OpenCode API
  useEffect(() => {
    const fetchCommands = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch config from OpenCode API
        const response = await opcClient.config.get();
        
        if (response.error) {
          throw new Error(String(response.error) || 'Failed to fetch commands');
        }

        // Extract MCP servers from config
        const config = response.data as any;
        const servers: MCPServer[] = [];

        // Parse MCP servers from config
        // The config might have mcpServers or we need to parse from tools/commands
        if (config?.mcpServers && Array.isArray(config.mcpServers)) {
          servers.push(...config.mcpServers);
        } else if (config?.tools && Array.isArray(config.tools)) {
          // Group tools by server/category
          const serverMap = new Map<string, MCPCommand[]>();
          
          config.tools.forEach((tool: any) => {
            const serverName = tool.server || tool.category || 'General';
            if (!serverMap.has(serverName)) {
              serverMap.set(serverName, []);
            }
            
            serverMap.get(serverName)?.push({
              name: tool.name,
              description: tool.description,
              schema: tool.inputSchema,
              category: tool.category,
              icon: getCommandIcon(tool.name, tool.category),
            });
          });

          // Convert map to server array
          serverMap.forEach((commands, name) => {
            servers.push({
              name,
              commands,
            });
          });
        }

        setMcpServers(servers);
        
        // Expand first server by default
        if (servers.length > 0) {
          setExpandedServers(new Set([servers[0].name]));
        }
      } catch (err) {
        console.error('Error fetching commands:', err);
        setError(err instanceof Error ? err.message : 'Failed to load commands');
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, []);

  // Toggle server expansion
  const toggleServer = (serverName: string) => {
    setExpandedServers(prev => {
      const next = new Set(prev);
      if (next.has(serverName)) {
        next.delete(serverName);
      } else {
        next.add(serverName);
      }
      return next;
    });
  };

  // Handle command selection
  const handleCommandClick = (command: MCPCommand, serverName: string) => {
    onCommandSelect?.(command, serverName);
  };

  // Filter commands based on search
  const filteredServers = mcpServers.map(server => ({
    ...server,
    commands: server.commands?.filter(cmd => 
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [],
  })).filter(server => server.commands.length > 0);

  // Loading state
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-6 ${className}`}>
        <div className="animate-spin mb-4">
          <Icon name="settings" size={32} color="primary" />
        </div>
        <p className="text-sm text-[#435663]">Loading commands...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-6 ${className}`}>
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <Icon name="minus" size={32} color="primary" />
        </div>
        <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#A3B087] text-white rounded-lg hover:bg-[#8B9474] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (mcpServers.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-6 ${className}`}>
        <div className="mb-4 p-3 bg-[#F3F4F6] rounded-lg">
          <Icon name="commands" size={32} color="primary" />
        </div>
        <p className="text-sm text-[#435663] text-center">No commands available</p>
        <p className="text-xs text-[#6B7280] text-center mt-2">
          Commands will appear here when MCP servers are configured
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="commands" size={20} color="primary" />
          <h2 className="text-lg font-semibold text-[#313647]">Commands</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size={16} color="primary" />
          </div>
          <input
            type="text"
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3B087] focus:border-transparent"
          />
        </div>
      </div>

      {/* Commands List */}
      <div className="flex-1 overflow-y-auto">
        {filteredServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <Icon name="search" size={32} color="primary" className="mb-2" />
            <p className="text-sm text-[#435663]">No commands found</p>
            <p className="text-xs text-[#6B7280] mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredServers.map((server) => (
              <div key={server.name} className="mb-2">
                {/* Server Header */}
                <button
                  onClick={() => toggleServer(server.name)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F3F4F6] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      name="add" 
                      size={16} 
                      color="primary"
                      className={`transition-transform ${expandedServers.has(server.name) ? 'rotate-45' : ''}`}
                    />
                    <span className="text-sm font-medium text-[#313647] group-hover:text-[#A3B087]">
                      {server.name}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      ({server.commands?.length || 0})
                    </span>
                  </div>
                </button>

                {/* Commands List */}
                {expandedServers.has(server.name) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {server.commands?.map((command) => (
                      <button
                        key={command.name}
                        onClick={() => handleCommandClick(command, server.name)}
                        className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-[#A3B087] hover:text-white transition-colors group text-left"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <Icon 
                            name={(command.icon as any) || 'commands'} 
                            size={16} 
                            color="primary"
                            className="group-hover:text-white"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#313647] group-hover:text-white truncate">
                            {command.name}
                          </div>
                          {command.description && (
                            <div className="text-xs text-[#6B7280] group-hover:text-white/80 mt-0.5 line-clamp-2">
                              {command.description}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-[#E5E7EB] bg-[#F9FAFB]">
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Icon name="dot" size={16} color="primary" />
          <span>
            {filteredServers.reduce((acc, s) => acc + (s.commands?.length || 0), 0)} commands available
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Get appropriate icon for command based on name/category
 */
function getCommandIcon(name: string, category?: string): string {
  const nameLower = name.toLowerCase();
  const categoryLower = category?.toLowerCase() || '';

  // File operations
  if (nameLower.includes('file') || nameLower.includes('upload') || nameLower.includes('download')) {
    return 'file-plus';
  }
  
  // Search operations
  if (nameLower.includes('search') || nameLower.includes('find')) {
    return 'search';
  }
  
  // Settings/config
  if (nameLower.includes('config') || nameLower.includes('setting')) {
    return 'settings';
  }
  
  // Share operations
  if (nameLower.includes('share')) {
    return 'share';
  }
  
  // Dashboard operations
  if (nameLower.includes('dashboard') || categoryLower.includes('dashboard')) {
    return 'dashboard-tab';
  }
  
  // Default
  return 'commands';
}

export default CommandsPanel;
