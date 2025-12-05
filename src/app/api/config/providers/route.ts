/**
 * Mock OpenCode API endpoint for providers
 * This simulates the OpenCode API server response for testing the ModelSelector component
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Mock response matching OpenCode API structure
  const mockResponse = {
    providers: [
      {
        id: 'github-copilot',
        name: 'GitHub Copilot',
        models: {
          'claude-3-5-sonnet-20241022': {
            id: 'claude-3-5-sonnet-20241022',
            providerID: 'github-copilot',
            name: 'Claude 3.5 Sonnet',
            status: 'active',
            limit: {
              context: 200000,
              output: 8192
            },
            capabilities: {
              temperature: true,
              reasoning: true,
              attachment: true,
              toolcall: true,
              input: {
                text: true,
                image: true,
                pdf: true
              },
              output: {
                text: true
              }
            }
          },
          'gpt-4o': {
            id: 'gpt-4o',
            providerID: 'github-copilot',
            name: 'GPT-4o',
            status: 'active',
            limit: {
              context: 128000,
              output: 16384
            },
            capabilities: {
              temperature: true,
              reasoning: false,
              attachment: true,
              toolcall: true,
              input: {
                text: true,
                image: true,
                pdf: true
              },
              output: {
                text: true
              }
            }
          },
          'gemini-2.0-flash-exp': {
            id: 'gemini-2.0-flash-exp',
            providerID: 'github-copilot',
            name: 'Gemini 2.0 Flash',
            status: 'active',
            limit: {
              context: 1000000,
              output: 8192
            },
            capabilities: {
              temperature: true,
              reasoning: true,
              attachment: true,
              toolcall: true,
              input: {
                text: true,
                image: true,
                video: true,
                pdf: true
              },
              output: {
                text: true
              }
            }
          },
          'gemini-3-pro-preview': {
            id: 'gemini-3-pro-preview',
            providerID: 'github-copilot',
            name: 'Gemini 3 Pro Preview',
            status: 'active',
            limit: {
              context: 2000000,
              output: 16384
            },
            capabilities: {
              temperature: true,
              reasoning: true,
              attachment: true,
              toolcall: true,
              input: {
                text: true,
                image: true,
                video: true,
                pdf: true
              },
              output: {
                text: true
              }
            }
          },
          'o1-preview': {
            id: 'o1-preview',
            providerID: 'github-copilot',
            name: 'GPT-o1 Preview',
            status: 'active',
            limit: {
              context: 128000,
              output: 32768
            },
            capabilities: {
              temperature: false,
              reasoning: true,
              attachment: false,
              toolcall: false,
              input: {
                text: true
              },
              output: {
                text: true
              }
            }
          },
          'o1': {
            id: 'o1',
            providerID: 'github-copilot',
            name: 'GPT-o1',
            status: 'active',
            limit: {
              context: 200000,
              output: 100000
            },
            capabilities: {
              temperature: false,
              reasoning: true,
              attachment: false,
              toolcall: false,
              input: {
                text: true
              },
              output: {
                text: true
              }
            }
          }
        }
      },
      {
        id: 'openai',
        name: 'OpenAI',
        models: {
          'gpt-4-turbo': {
            id: 'gpt-4-turbo',
            providerID: 'openai',
            name: 'GPT-4 Turbo',
            status: 'active',
            limit: {
              context: 128000,
              output: 4096
            },
            capabilities: {
              temperature: true,
              reasoning: false,
              attachment: true,
              toolcall: true,
              input: {
                text: true,
                image: true
              },
              output: {
                text: true
              }
            }
          },
          'gpt-3.5-turbo': {
            id: 'gpt-3.5-turbo',
            providerID: 'openai',
            name: 'GPT-3.5 Turbo',
            status: 'active',
            limit: {
              context: 16385,
              output: 4096
            },
            capabilities: {
              temperature: true,
              reasoning: false,
              attachment: false,
              toolcall: true,
              input: {
                text: true
              },
              output: {
                text: true
              }
            }
          }
        }
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        models: {
          'claude-3-opus': {
            id: 'claude-3-opus',
            providerID: 'anthropic',
            name: 'Claude 3 Opus',
            status: 'active',
            limit: {
              context: 200000,
              output: 4096
            },
            capabilities: {
              temperature: true,
              reasoning: true,
              attachment: true,
              toolcall: true,
              input: {
                text: true,
                image: true,
                pdf: true
              },
              output: {
                text: true
              }
            }
          },
          'claude-3-haiku': {
            id: 'claude-3-haiku',
            providerID: 'anthropic',
            name: 'Claude 3 Haiku',
            status: 'active',
            limit: {
              context: 200000,
              output: 4096
            },
            capabilities: {
              temperature: true,
              reasoning: false,
              attachment: true,
              toolcall: true,
              input: {
                text: true,
                image: true
              },
              output: {
                text: true
              }
            }
          }
        }
      }
    ],
    default: {
      'github-copilot': 'claude-3-5-sonnet-20241022'
    }
  };

  return NextResponse.json(mockResponse);
}
