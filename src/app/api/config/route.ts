import { NextResponse } from 'next/server';

/**
 * Next.js API Route Handler for OpenCode Config API
 * Proxies requests to the OpenCode server running on localhost:4096
 * Returns MCP server configuration and available tools/commands
 */

const OPENCODE_API_URL = process.env.OPENCODE_API_URL || 'http://localhost:4096';

export async function GET() {
  try {
    // Forward the request to the OpenCode API
    const response = await fetch(`${OPENCODE_API_URL}/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      console.error(`OpenCode API error: ${response.status} ${response.statusText}`);
      
      // Return mock MCP server data for development if OpenCode server is not running
      return NextResponse.json({
        mcpServers: [
          {
            name: 'File Operations',
            description: 'File system operations and management',
            commands: [
              {
                name: 'read_file',
                description: 'Read contents of a file',
                category: 'file',
                icon: 'file-text',
                schema: {
                  type: 'object',
                  properties: {
                    path: {
                      type: 'string',
                      description: 'Path to the file to read'
                    }
                  },
                  required: ['path']
                }
              },
              {
                name: 'write_file',
                description: 'Write contents to a file',
                category: 'file',
                icon: 'file-edit',
                schema: {
                  type: 'object',
                  properties: {
                    path: {
                      type: 'string',
                      description: 'Path to the file to write'
                    },
                    content: {
                      type: 'string',
                      description: 'Content to write to the file'
                    }
                  },
                  required: ['path', 'content']
                }
              },
              {
                name: 'list_directory',
                description: 'List contents of a directory',
                category: 'file',
                icon: 'folder',
                schema: {
                  type: 'object',
                  properties: {
                    path: {
                      type: 'string',
                      description: 'Path to the directory to list'
                    }
                  },
                  required: ['path']
                }
              }
            ]
          },
          {
            name: 'Code Analysis',
            description: 'Code analysis and search tools',
            commands: [
              {
                name: 'grep_search',
                description: 'Search for patterns in files using grep',
                category: 'search',
                icon: 'search',
                schema: {
                  type: 'object',
                  properties: {
                    pattern: {
                      type: 'string',
                      description: 'Search pattern (regex)'
                    },
                    path: {
                      type: 'string',
                      description: 'Path to search in'
                    }
                  },
                  required: ['pattern']
                }
              },
              {
                name: 'find_files',
                description: 'Find files matching a pattern',
                category: 'search',
                icon: 'file-search',
                schema: {
                  type: 'object',
                  properties: {
                    pattern: {
                      type: 'string',
                      description: 'File name pattern (glob)'
                    },
                    path: {
                      type: 'string',
                      description: 'Path to search in'
                    }
                  },
                  required: ['pattern']
                }
              }
            ]
          },
          {
            name: 'Web Operations',
            description: 'Web scraping and HTTP operations',
            commands: [
              {
                name: 'fetch_url',
                description: 'Fetch content from a URL',
                category: 'web',
                icon: 'globe',
                schema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      description: 'URL to fetch'
                    }
                  },
                  required: ['url']
                }
              },
              {
                name: 'scrape_page',
                description: 'Scrape and parse web page content',
                category: 'web',
                icon: 'download',
                schema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      description: 'URL to scrape'
                    },
                    selector: {
                      type: 'string',
                      description: 'CSS selector for content extraction'
                    }
                  },
                  required: ['url']
                }
              }
            ]
          },
          {
            name: 'Browser Automation',
            description: 'Browser automation and testing tools',
            commands: [
              {
                name: 'browser_navigate',
                description: 'Navigate browser to URL',
                category: 'browser',
                icon: 'monitor',
                schema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      description: 'URL to navigate to'
                    }
                  },
                  required: ['url']
                }
              },
              {
                name: 'browser_click',
                description: 'Click an element in the browser',
                category: 'browser',
                icon: 'mouse-pointer',
                schema: {
                  type: 'object',
                  properties: {
                    selector: {
                      type: 'string',
                      description: 'CSS selector for element to click'
                    }
                  },
                  required: ['selector']
                }
              },
              {
                name: 'browser_screenshot',
                description: 'Take screenshot of current page',
                category: 'browser',
                icon: 'camera',
                schema: {
                  type: 'object',
                  properties: {
                    path: {
                      type: 'string',
                      description: 'Path to save screenshot'
                    }
                  }
                }
              }
            ]
          },
          {
            name: 'Database Operations',
            description: 'Database query and management tools',
            commands: [
              {
                name: 'db_query',
                description: 'Execute database query',
                category: 'database',
                icon: 'database',
                schema: {
                  type: 'object',
                  properties: {
                    query: {
                      type: 'string',
                      description: 'SQL query to execute'
                    }
                  },
                  required: ['query']
                }
              },
              {
                name: 'db_list_tables',
                description: 'List all database tables',
                category: 'database',
                icon: 'table',
                schema: {
                  type: 'object',
                  properties: {}
                }
              }
            ]
          }
        ]
      });
    }

    // Parse and return the response
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching config from OpenCode API:', error);
    
    // Return mock MCP server data on error
    return NextResponse.json({
      mcpServers: [
        {
          name: 'File Operations',
          description: 'File system operations and management',
          commands: [
            {
              name: 'read_file',
              description: 'Read contents of a file',
              category: 'file',
              icon: 'file-text',
              schema: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    description: 'Path to the file to read'
                  }
                },
                required: ['path']
              }
            },
            {
              name: 'write_file',
              description: 'Write contents to a file',
              category: 'file',
              icon: 'file-edit',
              schema: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    description: 'Path to the file to write'
                  },
                  content: {
                    type: 'string',
                    description: 'Content to write to the file'
                  }
                },
                required: ['path', 'content']
              }
            },
            {
              name: 'list_directory',
              description: 'List contents of a directory',
              category: 'file',
              icon: 'folder',
              schema: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    description: 'Path to the directory to list'
                  }
                },
                required: ['path']
              }
            }
          ]
        },
        {
          name: 'Code Analysis',
          description: 'Code analysis and search tools',
          commands: [
            {
              name: 'grep_search',
              description: 'Search for patterns in files using grep',
              category: 'search',
              icon: 'search',
              schema: {
                type: 'object',
                properties: {
                  pattern: {
                    type: 'string',
                    description: 'Search pattern (regex)'
                  },
                  path: {
                    type: 'string',
                    description: 'Path to search in'
                  }
                },
                required: ['pattern']
              }
            },
            {
              name: 'find_files',
              description: 'Find files matching a pattern',
              category: 'search',
              icon: 'file-search',
              schema: {
                type: 'object',
                properties: {
                  pattern: {
                    type: 'string',
                    description: 'File name pattern (glob)'
                  },
                  path: {
                    type: 'string',
                    description: 'Path to search in'
                  }
                },
                required: ['pattern']
              }
            }
          ]
        },
        {
          name: 'Web Operations',
          description: 'Web scraping and HTTP operations',
          commands: [
            {
              name: 'fetch_url',
              description: 'Fetch content from a URL',
              category: 'web',
              icon: 'globe',
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL to fetch'
                  }
                },
                required: ['url']
              }
            },
            {
              name: 'scrape_page',
              description: 'Scrape and parse web page content',
              category: 'web',
              icon: 'download',
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL to scrape'
                  },
                  selector: {
                    type: 'string',
                    description: 'CSS selector for content extraction'
                  }
                },
                required: ['url']
              }
            }
          ]
        },
        {
          name: 'Browser Automation',
          description: 'Browser automation and testing tools',
          commands: [
            {
              name: 'browser_navigate',
              description: 'Navigate browser to URL',
              category: 'browser',
              icon: 'monitor',
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL to navigate to'
                  }
                },
                required: ['url']
              }
            },
            {
              name: 'browser_click',
              description: 'Click an element in the browser',
              category: 'browser',
              icon: 'mouse-pointer',
              schema: {
                type: 'object',
                properties: {
                  selector: {
                    type: 'string',
                    description: 'CSS selector for element to click'
                  }
                },
                required: ['selector']
              }
            },
            {
              name: 'browser_screenshot',
              description: 'Take screenshot of current page',
              category: 'browser',
              icon: 'camera',
              schema: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    description: 'Path to save screenshot'
                  }
                }
              }
            }
          ]
        },
        {
          name: 'Database Operations',
          description: 'Database query and management tools',
          commands: [
            {
              name: 'db_query',
              description: 'Execute database query',
              category: 'database',
              icon: 'database',
              schema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'SQL query to execute'
                  }
                },
                required: ['query']
              }
            },
            {
              name: 'db_list_tables',
              description: 'List all database tables',
              category: 'database',
              icon: 'table',
              schema: {
                type: 'object',
                properties: {}
              }
            }
          ]
        }
      ]
    });
  }
}
