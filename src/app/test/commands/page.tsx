'use client';

import React, { useState } from 'react';
import { CommandsPanel } from '@/components/chat/CommandsPanel';
import type { MCPCommand } from '@/types/opencode';

export default function CommandsTestPage() {
  const [selectedCommand, setSelectedCommand] = useState<{ command: MCPCommand; server: string } | null>(null);

  const handleCommandSelect = (command: MCPCommand, server: string) => {
    setSelectedCommand({ command, server });
    console.log('Selected command:', command, 'from server:', server);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#313647] mb-2">Commands Panel Test</h1>
          <p className="text-[#435663]">
            Testing the CommandsPanel component that fetches MCP commands from OpenCode API
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commands Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] h-[600px]">
              <CommandsPanel onCommandSelect={handleCommandSelect} />
            </div>
          </div>

          {/* Selected Command Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-semibold text-[#313647] mb-4">Selected Command Details</h2>
              
              {selectedCommand ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#435663]">Server</label>
                    <p className="mt-1 text-base text-[#313647]">{selectedCommand.server}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[#435663]">Command Name</label>
                    <p className="mt-1 text-base text-[#313647] font-mono bg-[#F3F4F6] px-3 py-2 rounded">
                      {selectedCommand.command.name}
                    </p>
                  </div>
                  
                  {selectedCommand.command.description && (
                    <div>
                      <label className="text-sm font-medium text-[#435663]">Description</label>
                      <p className="mt-1 text-sm text-[#313647]">{selectedCommand.command.description}</p>
                    </div>
                  )}
                  
                  {selectedCommand.command.category && (
                    <div>
                      <label className="text-sm font-medium text-[#435663]">Category</label>
                      <p className="mt-1 text-sm text-[#313647]">{selectedCommand.command.category}</p>
                    </div>
                  )}
                  
                  {selectedCommand.command.schema && (
                    <div>
                      <label className="text-sm font-medium text-[#435663]">Schema</label>
                      <pre className="mt-1 text-xs text-[#313647] bg-[#F3F4F6] p-3 rounded overflow-x-auto">
                        {JSON.stringify(selectedCommand.command.schema, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-[#E5E7EB]">
                    <button
                      onClick={() => {
                        console.log('Execute command:', selectedCommand);
                        alert(`Would execute command: ${selectedCommand.command.name} from ${selectedCommand.server}`);
                      }}
                      className="px-4 py-2 bg-[#A3B087] text-white rounded-lg hover:bg-[#8B9474] transition-colors"
                    >
                      Execute Command
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-[#9CA3AF]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <p className="text-[#435663]">No command selected</p>
                  <p className="text-sm text-[#6B7280] mt-1">Select a command from the panel to view details</p>
                </div>
              )}
            </div>

            {/* API Information */}
            <div className="mt-6 bg-[#F3F4F6] rounded-lg p-4 border border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#313647] mb-2">OpenCode API Configuration</h3>
              <div className="space-y-1 text-xs text-[#435663]">
                <p><strong>Endpoint:</strong> GET /config</p>
                <p><strong>Purpose:</strong> Fetch MCP servers and available commands</p>
                <p><strong>Response:</strong> Config object with mcpServers[] or tools[]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
