#!/usr/bin/env node
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import type {
  AgentUIBridgeCommandRequest,
  AgentUIBridgeRequestId
} from "@agent-ui/core";
import { resolve as pathResolve } from "node:path";
import { randomBytes } from "node:crypto";
import {
  createAgentUIMcpListener,
  type AgentUIMcpListener,
  type AgentUIMcpAppSession
} from "./listener.js";
import {
  createPlatformSkillResolver,
  getPlatformSkillResourceUris,
  listPlatformSkillEntries,
  searchPlatformSkills,
  recommendPlatformSkills,
  type PlatformSkillResolver
} from "./platform-skills.js";

const SERVER_NAME = "agent-ui-mcp";
const SERVER_VERSION = "0.0.0";

const INSPECT_TREE_SCHEMA = {
  type: "object" as const,
  properties: {
    sessionId: {
      type: "string",
      description: "Optional active session id."
    },
    screen: {
      type: "string",
      description: "Optional screen scope to restrict the tree."
    },
    rootId: {
      type: "string",
      description: "Optional root semantic id."
    },
    includeHidden: {
      type: "boolean",
      description: "Include hidden subtrees in the result."
    },
    includeBounds: {
      type: "boolean",
      description: "Include bounding-rect metadata."
    },
    maxDepth: {
      type: "number",
      description: "Maximum tree depth."
    }
  }
};

const GET_STATE_SCHEMA = {
  type: "object" as const,
  properties: {
    id: {
      type: "string",
      description: "Required stable semantic node id."
    },
    sessionId: {
      type: "string",
      description: "Optional active session id."
    },
    includeChildren: {
      type: "boolean",
      description: "Include child nodes in the result."
    }
  },
  required: ["id"]
};

const TAP_SCHEMA = {
  type: "object" as const,
  properties: {
    id: {
      type: "string",
      description: "Required stable semantic node id to tap."
    },
    sessionId: {
      type: "string",
      description: "Optional active session id."
    },
    screen: {
      type: "string",
      description: "Optional screen scope to resolve the node id."
    },
    action: {
      type: "string",
      description: "Optional action name (default 'tap')."
    },
    timeoutMs: {
      type: "number",
      description: "Optional command timeout in milliseconds."
    }
  },
  required: ["id"]
};

const INPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    id: {
      type: "string",
      description: "Required stable semantic node id of the input field."
    },
    value: {
      type: "string",
      description: "Required text value to input."
    },
    sessionId: {
      type: "string",
      description: "Optional active session id."
    },
    screen: {
      type: "string",
      description: "Optional screen scope to resolve the node id."
    },
    timeoutMs: {
      type: "number",
      description: "Optional command timeout in milliseconds."
    }
  },
  required: ["id", "value"]
};

const OBSERVE_EVENTS_SCHEMA = {
  type: "object" as const,
  properties: {
    sessionId: {
      type: "string",
      description: "Optional active session id."
    },
    since: {
      type: "number",
      description: "Optional cursor to fetch events after."
    },
    types: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "bridge.session.connected",
          "bridge.session.paired",
          "bridge.session.disconnected",
          "bridge.session.expired",
          "bridge.command.received",
          "bridge.command.completed",
          "bridge.command.failed",
          "bridge.error"
        ]
      },
      description: "Optional event type filter."
    },
    limit: {
      type: "number",
      description: "Optional maximum number of events to return."
    }
  }
};

const WAIT_FOR_SCHEMA = {
  type: "object" as const,
  properties: {
    conditions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: ["nodeExists", "nodeVisible", "nodeState", "nodeAbsent"]
          },
          nodeId: {
            type: "string"
          },
          screen: {
            type: "string"
          },
          expectedState: {}
        },
        required: ["kind", "nodeId"]
      },
      description: "Required array of wait conditions."
    },
    sessionId: {
      type: "string",
      description: "Optional active session id."
    },
    timeoutMs: {
      type: "number",
      description: "Optional timeout in milliseconds."
    }
  },
  required: ["conditions"]
};

const SCROLL_SCHEMA = {
  type: "object" as const,
  properties: {
    id: {
      type: "string",
      description: "Required stable semantic node id of the scroll container."
    },
    sessionId: {
      type: "string",
      description: "Optional active session id."
    },
    direction: {
      type: "string",
      enum: ["up", "down", "left", "right"],
      description: "Optional scroll direction (default 'down')."
    },
    amount: {
      type: "number",
      description: "Optional scroll amount in logical pixels."
    },
    targetId: {
      type: "string",
      description: "Optional target node id to scroll to."
    },
    timeoutMs: {
      type: "number",
      description: "Optional command timeout in milliseconds."
    }
  },
  required: ["id"]
};

const NAVIGATE_SCHEMA = {
  type: "object" as const,
  properties: {
    sessionId: {
      type: "string",
      description: "Optional active session id."
    },
    screen: {
      type: "string",
      description: "Optional target screen name."
    },
    route: {
      type: "string",
      description: "Optional route path."
    },
    params: {
      type: "object",
      description: "Optional route or screen parameters (redacted before exposure)."
    },
    replace: {
      type: "boolean",
      description: "Optional replace current screen instead of pushing (default false)."
    },
    timeoutMs: {
      type: "number",
      description: "Optional command timeout in milliseconds."
    }
  }
};

const RUN_FLOW_SCHEMA = {
  type: "object" as const,
  properties: {
    sessionId: {
      type: "string",
      description: "Optional active session id."
    },
    name: {
      type: "string",
      description: "Optional flow name for discovery and reporting."
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["tap", "input", "scroll", "navigate", "waitFor", "assert", "observeEvents"]
          },
          targetId: {
            type: "string"
          },
          value: {
            type: "string"
          },
          conditions: {
            type: "array"
          },
          screen: {
            type: "string"
          }
        },
        required: ["type"]
      },
      description: "Optional array of flow steps to execute sequentially."
    },
    stopOnFailure: {
      type: "boolean",
      description: "Optional stop flow execution on first failure (default true)."
    },
    timeoutMs: {
      type: "number",
      description: "Optional per-step timeout in milliseconds."
    }
  }
};

function makeRequestId(): AgentUIBridgeRequestId {
  return `mcp_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}` as AgentUIBridgeRequestId;
}

function generatePairingToken(): string {
  return `agentui_${randomBytes(32).toString("hex")}`;
}

function getSession(
  listener: AgentUIMcpListener
): AgentUIMcpAppSession | undefined {
  const active = listener.activeSession;

  if (!active || active.state === "disconnected") {
    return undefined;
  }

  return active;
}

function buildErrorResult(
  code: string,
  message: string
): {
  content: { type: "text"; text: string }[];
  isError: true;
} {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ ok: false, code, message })
      }
    ],
    isError: true
  };
}

export interface AgentUIMcpServerOptions {
  host?: string | undefined;
  port?: number | undefined;
  pairingToken?: string | undefined;
  platformSkillsDir?: string | undefined;
}

export function createAgentUIMcpServer(
  listener: AgentUIMcpListener,
  transport: Transport,
  resolver?: PlatformSkillResolver | undefined
): Server {
  const skillResolver =
    resolver ??
    createPlatformSkillResolver(
      pathResolve(__dirname, "../../../docs/reference/agent")
    );

  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );

  // --- skill-context resources ---

  const resources = getPlatformSkillResourceUris();

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const runtimeResources = [
      {
        uri: "agent-ui://sessions",
        name: "Sessions",
        description: "Current active app session metadata including session id, app identity, platform, capabilities, connection state, and uptime.",
        mimeType: "application/json"
      },
      {
        uri: "agent-ui://diagnostics",
        name: "Diagnostics",
        description: "Listener, bridge, and server diagnostics: transport mode, bind address, port, session count, uptime, and version info.",
        mimeType: "application/json"
      }
    ];

    return {
      resources: [
        ...resources.map((r) => ({
          uri: r.uri,
          name: r.name,
          description: r.description,
          mimeType: r.mimeType
        })),
        ...runtimeResources
      ]
    };
  });

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request) => {
      const uri = request.params.uri;

      // --- runtime resources ---

      if (uri === "agent-ui://sessions") {
        const session = listener.activeSession;

        const payload = {
          ok: true,
          connected: session !== undefined,
          session: session
            ? {
                sessionId: session.sessionId,
                appId: session.appId,
                appName: session.appName,
                capabilities: session.capabilities,
                state: session.state,
                connectedAt: session.connectedAt,
                uptimeMs: Date.now() - session.connectedAt
              }
            : null
        };

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(payload, null, 2)
            }
          ]
        };
      }

      if (uri === "agent-ui://diagnostics") {
        const session = listener.activeSession;

        const payload = {
          ok: true,
          server: {
            name: SERVER_NAME,
            version: SERVER_VERSION,
            transport: "stdio"
          },
          listener: {
            state: listener.state,
            host: listener.host,
            port: listener.port
          },
          activeSession: session
            ? {
                sessionId: session.sessionId,
                state: session.state,
                connectedAt: session.connectedAt,
                uptimeMs: Date.now() - session.connectedAt
              }
            : null
        };

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(payload, null, 2)
            }
          ]
        };
      }

      // --- platform skill resources ---

      const result = skillResolver.readUri(uri);

      if ("error" in result) {
        return {
          contents: [
            {
              uri,
              mimeType: "text/plain",
              text: JSON.stringify({ ok: false, code: result.code, message: result.error })
            }
          ]
        };
      }

      return {
        contents: [
          {
            uri: result.content.uri,
            mimeType: result.content.mimeType,
            text: result.content.text
          }
        ]
      };
    }
  );

  // --- MCP prompts (read-only, no session required) ---

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: "choose_platform_skills",
        description:
          "Select platform skills to load based on a task, optional stage, and platforms. Returns a short list of skill resources and rationale.",
        arguments: [
          { name: "task", description: "The task description to match skills against.", required: true },
          { name: "stage", description: "Optional product stage for context-aware matching.", required: false },
          { name: "platforms", description: "Optional target platforms as comma-separated list (e.g. 'ios,android').", required: false }
        ]
      },
      {
        name: "plan_native_scaffold",
        description:
          "Create a scoped scaffold plan for native mobile features. Returns a plan with non-goals and validation steps.",
        arguments: [
          { name: "scaffoldIntent", description: "What kind of native scaffold is needed (e.g. 'new screen', 'adapter').", required: false },
          { name: "platform", description: "Optional target platform ('ios' or 'android').", required: false },
          { name: "stage", description: "Optional product stage for context.", required: false }
        ]
      },
      {
        name: "review_accessibility_semantics",
        description:
          "Review accessibility semantics for a screen or component on a target platform. Returns issues, fixes, and verification steps.",
        arguments: [
          { name: "platform", description: "Target platform ('ios' or 'android').", required: false },
          { name: "screenOrComponent", description: "The screen or component name to audit.", required: false },
          { name: "codeContext", description: "Optional code snippet or file reference.", required: false }
        ]
      },
      {
        name: "prepare_visual_editor_notes",
        description:
          "Prepare development-only editor notes for multi-session visual comparison. Returns notes with redaction and multi-session constraints.",
        arguments: [
          { name: "sessions", description: "Connected runtime session IDs to compare.", required: false },
          { name: "platforms", description: "Optional platform list as comma-separated string (e.g. 'ios,android').", required: false },
          { name: "adapterCapabilities", description: "Optional adapter capability flags as comma-separated string.", required: false }
        ]
      },
      {
        name: "write_agent_task_notes",
        description:
          "Write hidden notes for agent task scope, assumptions, checks, and handoff. Uses context prompt engineering guidance.",
        arguments: [
          { name: "task", description: "The task description.", required: true },
          { name: "stage", description: "Product stage number.", required: false },
          { name: "selectedSkills", description: "Optional skill names as comma-separated list.", required: false }
        ]
      },
      {
        name: "debug_stage_failure",
        description:
          "Create a root-cause investigation plan for a stage failure. Returns a falsifiable hypothesis, required red test/probe/command, green rerun target, and status classification.",
        arguments: [
          { name: "stage", description: "Product stage number.", required: true },
          { name: "commandOrSymptom", description: "The failing command or symptom description.", required: true },
          { name: "package", description: "Optional affected package name.", required: false },
          { name: "evidence", description: "Optional error output or evidence.", required: false }
        ]
      }
    ]
  }));

  server.setRequestHandler(
    GetPromptRequestSchema,
    async (request) => {
      const { name, arguments: args } = request.params;
      const a = (args as Record<string, unknown> | undefined) ?? {};

      if (name === "choose_platform_skills") {
        const task = typeof a.task === "string" ? a.task : "";
        const stage = typeof a.stage === "string" ? a.stage : undefined;
        const platformsStr = typeof a.platforms === "string" ? a.platforms : undefined;
        const platforms = platformsStr
          ? platformsStr.split(",").map((s: string) => s.trim()).filter(Boolean)
          : undefined;

        const recs = recommendPlatformSkills(task, { stage, platforms });

        const skillList = recs.length > 0
          ? recs.map((r) => `- **${r.skill}** (${r.resourceUri}): ${r.reasons.join("; ")}${r.warnings.length > 0 ? ` [WARNING: ${r.warnings.join("; ")}]` : ""}`).join("\n")
          : "No matching platform skills found for this task.";

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `# Choose Platform Skills\n\nTask: ${task}${stage ? `\nStage: ${stage}` : ""}${platforms ? `\nPlatforms: ${platforms.join(", ")}` : ""}\n\n## Recommended Skills\n\n${skillList}\n\nLoad only the skills relevant to the immediate task. Use the getPlatformSkill tool to read a skill's full content or the listPlatformSkills tool to see all available skills. Start with the highest-relevance skill and load others only as needed.`
              }
            }
          ]
        };
      }

      if (name === "plan_native_scaffold") {
        const scaffoldIntent = typeof a.scaffoldIntent === "string" ? a.scaffoldIntent : "new feature";
        const platform = typeof a.platform === "string" ? a.platform : "cross-platform";
        const stage = typeof a.stage === "string" ? a.stage : undefined;

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `# Plan Native Scaffold\n\nScaffold intent: ${scaffoldIntent}\nPlatform: ${platform}${stage ? `\nStage: ${stage}` : ""}\n\nCreate a scoped scaffold plan with:\n- Component file paths and names\n- Required imports and providers\n- Semantic ID strategy for actionable nodes\n- Accessibility baseline (roles, labels, states)\n- Non-goals (explicit exclusions)\n- Verification steps (typecheck, build, test targets)\n\nUse getPlatformSkill to load skills as needed (expo-skill, vercel-react-native-skills, native-accessibility-engineering, plus platform-specific skills).`
              }
            }
          ]
        };
      }

      if (name === "review_accessibility_semantics") {
        const platform = typeof a.platform === "string" ? a.platform : "ios";
        const screenOrComponent = typeof a.screenOrComponent === "string" ? a.screenOrComponent : "unknown";
        const codeContext = typeof a.codeContext === "string" ? a.codeContext : undefined;

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `# Review Accessibility Semantics\n\nPlatform: ${platform}\nScreen/Component: ${screenOrComponent}${codeContext ? `\nCode context:\n\`\`\`\n${codeContext}\n\`\`\`` : ""}\n\nAudit accessibility semantics for:\n- Stable semantic IDs on actionable nodes\n- Accessibility roles, labels, hints, and states\n- Dynamic Type / font scaling support\n- Color contrast and touch-target sizing\n- Screen reader flow order (VoiceOver for iOS, TalkBack for Android)\n- Reduced motion compliance\n- Keyboard/D-pad navigation (if applicable)\n\nUse getPlatformSkill to load native-accessibility-engineering and platform-specific skills. Output issues, concrete fixes, and verification steps.`
              }
            }
          ]
        };
      }

      if (name === "prepare_visual_editor_notes") {
        const sessions = typeof a.sessions === "string" ? a.sessions : "unknown";
        const platformsStr = typeof a.platforms === "string" ? a.platforms : undefined;
        const platforms = platformsStr
          ? platformsStr.split(",").map((s: string) => s.trim()).filter(Boolean)
          : undefined;
        const adapterStr = typeof a.adapterCapabilities === "string" ? a.adapterCapabilities : undefined;
        const adapterCapabilities = adapterStr
          ? adapterStr.split(",").map((s: string) => s.trim()).filter(Boolean)
          : undefined;

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `# Prepare Visual Editor Notes\n\nSessions: ${sessions}${platforms ? `\nPlatforms: ${platforms.join(", ")}` : ""}${adapterCapabilities ? `\nAdapter capabilities: ${adapterCapabilities.join(", ")}` : ""}\n\nPrepare development-only editor notes:\n- Map connected runtime sessions to semantic trees\n- Compare capabilities, adapter flags, and diagnostics across sessions\n- Identify semantic ID mismatches between sessions\n- Document redaction requirements before any visual evidence is collected\n- Note multi-session constraints: iOS SwiftUI and Android Compose cannot render in the same simulator\n- Include verification that both sessions are in the same logical screen/state\n\nKeep all notes developer-facing and redaction-gated. Do not expose app user data.`
              }
            }
          ]
        };
      }

      if (name === "write_agent_task_notes") {
        const task = typeof a.task === "string" ? a.task : "";
        const stage = typeof a.stage === "string" ? a.stage : undefined;
        const skillsStr = typeof a.selectedSkills === "string" ? a.selectedSkills : undefined;
        const selectedSkills = skillsStr
          ? skillsStr.split(",").map((s: string) => s.trim()).filter(Boolean)
          : undefined;

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `# Write Agent Task Notes\n\nTask: ${task}${stage ? `\nStage: ${stage}` : ""}${selectedSkills ? `\nSelected skills: ${selectedSkills.join(", ")}` : ""}\n\nWrite hidden task notes covering:\n- Task scope and explicit non-goals\n- Assumptions and preconditions\n- Required reference docs to open\n- Verification commands\n- Expected output format\n- Acceptance criteria\n- Handoff notes for the next agent\n- Any known concerns or implementation gates\n\nUse getPlatformSkill to load context-prompt-engineering for note structure guidance.`
              }
            }
          ]
        };
      }

      if (name === "debug_stage_failure") {
        const stage = typeof a.stage === "string" ? a.stage : "";
        const commandOrSymptom = typeof a.commandOrSymptom === "string" ? a.commandOrSymptom : "";
        const pkg = typeof a.package === "string" ? a.package : undefined;
        const evidence = typeof a.evidence === "string" ? a.evidence : undefined;

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `# Debug Stage Failure\n\nStage: ${stage}\nSymptom: ${commandOrSymptom}${pkg ? `\nPackage: ${pkg}` : ""}${evidence ? `\nEvidence:\n\`\`\`\n${evidence}\n\`\`\`` : ""}\n\nCreate a root-cause investigation plan:\n1. Reproduce the failure with the smallest command\n2. State one falsifiable hypothesis about the root cause\n3. Define the required red test/probe/command that should fail before the fix\n4. Define the green rerun target (same check passing after fix)\n5. Classify as BUG, ACTIVE_STAGE_GAP, SECURITY_GAP, or BLOCKED\n6. Follow TTD/TDD red-green: red test first, fix root cause, green rerun, broaden verification\n\nUse getPlatformSkill to load systematic-debugging for the full debugging protocol. Do not change source files before completing root-cause investigation.`
              }
            }
          ]
        };
      }

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Prompt '${name}' not found. Available: choose_platform_skills, plan_native_scaffold, review_accessibility_semantics, prepare_visual_editor_notes, write_agent_task_notes, debug_stage_failure.`
            }
          }
        ]
      };
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "inspectTree",
        description:
          "Inspect the semantic tree of the connected app. Returns tree structure, revision, capabilities, and optional bounds/hidden metadata.",
        inputSchema: INSPECT_TREE_SCHEMA
      },
      {
        name: "getState",
        description:
          "Get the semantic state of a specific node by stable id. Returns node metadata, revision, candidates for disambiguation, and redaction markers.",
        inputSchema: GET_STATE_SCHEMA
      },
      {
        name: "tap",
        description:
          "Dispatch a tap (press) action on a semantic node by stable id. Returns action result, revision, and structured error codes for unsupported or disabled nodes.",
        inputSchema: TAP_SCHEMA
      },
      {
        name: "input",
        description:
          "Set the text value of a semantic input node by stable id. Returns value state after the input, redaction markers for secure fields, and structured error codes.",
        inputSchema: INPUT_SCHEMA
      },
      {
        name: "observeEvents",
        description:
          "Retrieve bridge session events from the event log. Supports cursor-based pagination, type filtering, and result limiting.",
        inputSchema: OBSERVE_EVENTS_SCHEMA
      },
      {
        name: "waitFor",
        description:
          "Wait for one or more semantic conditions to be satisfied. Supports nodeExists, nodeVisible, nodeState, and nodeAbsent conditions with optional timeout.",
        inputSchema: WAIT_FOR_SCHEMA
      },
      {
        name: "scroll",
        description:
          "Scroll a semantic scroll container by stable id. Supports direction, pixel amount, and target-child scrolling. Returns offset, visible range, and structured error codes.",
        inputSchema: SCROLL_SCHEMA
      },
      {
        name: "navigate",
        description:
          "Navigate to a screen or route in the connected app. Supports screen name, route path, params, and replace behavior. Returns current screen and structured error codes.",
        inputSchema: NAVIGATE_SCHEMA
      },
      {
        name: "runFlow",
        description:
          "Execute a sequence of semantic flow steps (tap, input, scroll, navigate, waitFor, assert, observeEvents) against the connected app. Returns flow results, step details, and failure diagnostics.",
        inputSchema: RUN_FLOW_SCHEMA
      },
      {
        name: "listPlatformSkills",
        description:
          "List available repo-local platform skills. Returns skill names, descriptions, and resource URIs. No app session required.",
        inputSchema: {
          type: "object" as const,
          properties: {}
        }
      },
      {
        name: "getPlatformSkill",
        description:
          "Read a repo-local platform skill by name. Returns full SKILL.md content with truncation metadata. No app session required.",
        inputSchema: {
          type: "object" as const,
          properties: {
            name: {
              type: "string",
              description: "Required skill name (e.g. 'expo-skill', 'systematic-debugging')."
            }
          },
          required: ["name"]
        }
      },
      {
        name: "searchPlatformSkills",
        description:
          "Search repo-local platform skills by query terms. Returns ranked matches with skill name, score, and optional snippets. No app session required.",
        inputSchema: {
          type: "object" as const,
          properties: {
            query: {
              type: "string",
              description: "Required search query string."
            },
            skillNames: {
              type: "array",
              items: { type: "string" },
              description: "Optional skill names to scope the search."
            },
            limit: {
              type: "number",
              description: "Optional maximum number of results."
            },
            includeSnippets: {
              type: "boolean",
              description: "Optional include description snippets in results."
            }
          },
          required: ["query"]
        }
      },
      {
        name: "recommendPlatformSkills",
        description:
          "Recommend platform skills for a task using keyword matching. Returns skills with resource URIs, reasons, and warnings. No app session required.",
        inputSchema: {
          type: "object" as const,
          properties: {
            task: {
              type: "string",
              description: "Required task description to match skills against."
            },
            stage: {
              type: "string",
              description: "Optional product stage for context-aware recommendations."
            },
            platforms: {
              type: "array",
              items: { type: "string" },
              description: "Optional target platforms."
            },
            scaffoldIntent: {
              type: "string",
              description: "Optional scaffold intent for narrowing recommendations."
            }
          },
          required: ["task"]
        }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;

    // --- skill-context tools (no session required) ---

    if (toolName === "listPlatformSkills") {
      try {
        const entries = listPlatformSkillEntries();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ok: true, skills: entries })
            }
          ],
          structuredContent: { ok: true, skills: entries }
        };
      } catch {
        return buildErrorResult(
          "SKILL_INDEX_UNAVAILABLE",
          "could not read the platform skill index"
        );
      }
    }

    if (toolName === "getPlatformSkill") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (typeof args?.name !== "string" || args.name.length === 0) {
        return buildErrorResult(
          "INVALID_ARGUMENT",
          "name is required and must be a non-empty string"
        );
      }

      const result = skillResolver.getSkillContent(args.name);

      if ("error" in result) {
        return buildErrorResult(result.code, result.error);
      }

      return {
        content: [
          {
            type: "text",
            text: result.content.text
          }
        ],
        structuredContent: {
          ok: true,
          name: result.content.name,
          uri: result.content.uri,
          mimeType: result.content.mimeType,
          text: result.content.text,
          byteLength: result.content.byteLength,
          truncated: result.content.truncated,
          maxBytes: result.content.maxBytes
        }
      };
    }

    if (toolName === "searchPlatformSkills") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (typeof args?.query !== "string" || args.query.trim().length === 0) {
        return buildErrorResult(
          "QUERY_EMPTY",
          "query is required and must be a non-empty string"
        );
      }

      try {
        const matches = searchPlatformSkills(args.query, {
          skillNames:
            Array.isArray(args.skillNames) && args.skillNames.every((s: unknown) => typeof s === "string")
              ? (args.skillNames as string[])
              : undefined,
          limit: typeof args.limit === "number" && args.limit > 0 ? args.limit : undefined,
          includeSnippets: args.includeSnippets === true ? true : undefined
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ok: true, matches })
            }
          ],
          structuredContent: { ok: true, matches }
        };
      } catch {
        return buildErrorResult(
          "SEARCH_UNAVAILABLE",
          "could not search platform skills"
        );
      }
    }

    if (toolName === "recommendPlatformSkills") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (typeof args?.task !== "string" || args.task.trim().length === 0) {
        return buildErrorResult(
          "TASK_EMPTY",
          "task is required and must be a non-empty string"
        );
      }

      try {
        const recs = recommendPlatformSkills(args.task, {
          stage: typeof args.stage === "string" ? args.stage : undefined,
          platforms:
            Array.isArray(args.platforms) && args.platforms.every((p: unknown) => typeof p === "string")
              ? (args.platforms as string[])
              : undefined,
          scaffoldIntent: typeof args.scaffoldIntent === "string" ? args.scaffoldIntent : undefined
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ok: true, recommendations: recs })
            }
          ],
          structuredContent: { ok: true, recommendations: recs }
        };
      } catch {
        return buildErrorResult(
          "TASK_EMPTY",
          "could not recommend platform skills for the provided task"
        );
      }
    }

    // --- runtime-control tools (session required) ---

    const session = getSession(listener);

    if (!session) {
      return buildErrorResult(
        "SESSION_NOT_CONNECTED",
        "no active app session is connected"
      );
    }

    if (toolName === "inspectTree") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      try {
        const response = await session.sendCommand({
          type: "inspectTree",
          requestId: makeRequestId(),
          options: {
            screen: typeof args?.screen === "string" ? args.screen : undefined,
            includeHidden: args?.includeHidden === true ? true : undefined,
            maxDepth:
              typeof args?.maxDepth === "number"
                ? args.maxDepth
                : undefined,
            rootId:
              typeof args?.rootId === "string"
                ? args.rootId
                : undefined
          }
        });

        const raw = response as unknown as Record<string, unknown>;

        if (raw.type === "inspectTree" && raw.tree !== undefined) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: true,
                  tree: raw.tree,
                  timestamp: raw.timestamp
                })
              }
            ]
          };
        }

        const err = raw as unknown as { error?: string; result?: string };

        return buildErrorResult(
          err.error ?? err.result ?? "TREE_UNAVAILABLE",
          "inspectTree response had no tree data"
        );
      } catch (err) {
        return buildErrorResult(
          "COMMAND_FAILED",
          err instanceof Error ? err.message : "inspectTree failed"
        );
      }
    }

    if (toolName === "getState") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (typeof args?.id !== "string" || args.id.length === 0) {
        return buildErrorResult(
          "INVALID_ARGUMENT",
          "id is required and must be a non-empty string"
        );
      }

      try {
        const response = await session.sendCommand({
          type: "getState",
          requestId: makeRequestId(),
          nodeId: args.id,
          ...(typeof args.screen === "string"
            ? { options: { screen: args.screen } }
            : {})
        });

        const raw = response as unknown as Record<string, unknown>;

        if (raw.type === "getState" && raw.node !== undefined) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: true,
                  node: raw.node,
                  nodeId: raw.nodeId,
                  timestamp: raw.timestamp
                })
              }
            ]
          };
        }

        const err = raw as unknown as { error?: string; result?: string };

        if (err.result === "NODE_NOT_FOUND" || err.error === "NODE_NOT_FOUND") {
          return buildErrorResult(
            "NODE_NOT_FOUND",
            `semantic node '${args.id}' was not found in the visible tree`
          );
        }

        if (
          err.result === "DUPLICATE_NODE_ID" ||
          err.error === "DUPLICATE_NODE_ID"
        ) {
          return buildErrorResult(
            "DUPLICATE_NODE_ID",
            `multiple nodes match '${args.id}'; provide a screen scope`
          );
        }

        return buildErrorResult(
          err.error ?? err.result ?? "NODE_NOT_FOUND",
          `getState for '${args.id}' returned no node data`
        );
      } catch (err) {
        return buildErrorResult(
          "COMMAND_FAILED",
          err instanceof Error ? err.message : "getState failed"
        );
      }
    }

    if (toolName === "tap") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (typeof args?.id !== "string" || args.id.length === 0) {
        return buildErrorResult(
          "INVALID_ARGUMENT",
          "id is required and must be a non-empty string"
        );
      }

      try {
        const response = await session.sendCommand({
          type: "tap",
          requestId: makeRequestId(),
          targetId: args.id,
          ...(typeof args.action === "string"
            ? { action: args.action }
            : {}),
          ...(typeof args.screen === "string"
            ? { options: { screen: args.screen } }
            : {})
        });

        const raw = response as unknown as Record<string, unknown>;

        if (raw.type === "tap") {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: raw.result === "OK",
                  id: raw.targetId,
                  result: raw.result,
                  ...(raw.error !== undefined
                    ? { error: raw.error }
                    : {}),
                  timestamp: raw.timestamp
                })
              }
            ]
          };
        }

        const err = raw as unknown as { result?: string; error?: string };

        return buildErrorResult(
          err.result ?? err.error ?? "ACTION_FAILED",
          `tap on '${args.id}' failed`
        );
      } catch (err) {
        return buildErrorResult(
          "COMMAND_FAILED",
          err instanceof Error ? err.message : "tap failed"
        );
      }
    }

    if (toolName === "input") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (typeof args?.id !== "string" || args.id.length === 0) {
        return buildErrorResult(
          "INVALID_ARGUMENT",
          "id is required and must be a non-empty string"
        );
      }

      if (typeof args?.value !== "string") {
        return buildErrorResult(
          "INVALID_ARGUMENT",
          "value is required and must be a non-empty string"
        );
      }

      try {
        const response = await session.sendCommand({
          type: "input",
          requestId: makeRequestId(),
          targetId: args.id,
          text: args.value,
          ...(typeof args.screen === "string"
            ? { options: { screen: args.screen } }
            : {})
        });

        const raw = response as unknown as Record<string, unknown>;

        if (raw.type === "input") {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: raw.result === "OK",
                  id: raw.targetId,
                  result: raw.result,
                  ...(raw.error !== undefined
                    ? { error: raw.error }
                    : {}),
                  timestamp: raw.timestamp
                })
              }
            ]
          };
        }

        const err = raw as unknown as { result?: string; error?: string };

        return buildErrorResult(
          err.result ?? err.error ?? "ACTION_FAILED",
          `input on '${args.id}' failed`
        );
      } catch (err) {
        return buildErrorResult(
          "COMMAND_FAILED",
          err instanceof Error ? err.message : "input failed"
        );
      }
    }

    if (toolName === "observeEvents") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      try {
        const requestPayload: Record<string, unknown> = {
          type: "observeEvents",
          requestId: makeRequestId()
        };

        if (typeof args?.since === "number") {
          requestPayload.since = args.since;
        }

        if (Array.isArray(args?.types) && args.types.every((t) => typeof t === "string")) {
          requestPayload.eventTypes = args.types;
        }

        if (typeof args?.limit === "number" && args.limit > 0) {
          requestPayload.limit = args.limit;
        }

        const response = await session.sendCommand(
          requestPayload as unknown as AgentUIBridgeCommandRequest
        );

        const raw = response as unknown as Record<string, unknown>;

        if (raw.type === "observeEvents" && raw.events !== undefined) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: true,
                  events: raw.events,
                  nextCursor: raw.nextCursor,
                  droppedCount: raw.droppedCount ?? 0,
                  timestamp: raw.timestamp
                })
              }
            ]
          };
        }

        const err = raw as unknown as { result?: string; error?: string };

        return buildErrorResult(
          err.result ?? err.error ?? "COMMAND_FAILED",
          "observeEvents returned no event data"
        );
      } catch (err) {
        return buildErrorResult(
          "COMMAND_FAILED",
          err instanceof Error ? err.message : "observeEvents failed"
        );
      }
    }

    if (toolName === "waitFor") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (!Array.isArray(args?.conditions) || args.conditions.length === 0) {
        return buildErrorResult(
          "CONDITIONS_REQUIRED",
          "conditions must be a non-empty array of wait condition objects"
        );
      }

      const conditions: unknown[] = [];
      const validKinds = new Set(["nodeExists", "nodeVisible", "nodeState", "nodeAbsent"]);

      for (const c of args.conditions) {
        const cond = c as Record<string, unknown>;

        if (typeof cond.kind !== "string" || !validKinds.has(cond.kind)) {
          return buildErrorResult(
            "INVALID_CONDITION",
            `each condition must have a valid kind (nodeExists, nodeVisible, nodeState, nodeAbsent), got '${String(cond.kind)}'`
          );
        }

        if (typeof cond.nodeId !== "string" || cond.nodeId.length === 0) {
          return buildErrorResult(
            "INVALID_CONDITION",
            "each condition must have a non-empty nodeId"
          );
        }

        const mapped: Record<string, unknown> = {
          kind: cond.kind,
          nodeId: cond.nodeId
        };

        if (typeof cond.screen === "string") {
          mapped.screen = cond.screen;
        }

        if (cond.expectedState !== undefined) {
          mapped.expectedState = cond.expectedState;
        }

        conditions.push(mapped);
      }

      try {
        const requestPayload: Record<string, unknown> = {
          type: "waitFor",
          requestId: makeRequestId(),
          conditions
        };

        if (typeof args?.timeoutMs === "number" && args.timeoutMs > 0) {
          requestPayload.timeout = args.timeoutMs;
        }

        const response = await session.sendCommand(
          requestPayload as unknown as AgentUIBridgeCommandRequest
        );

        const raw = response as unknown as Record<string, unknown>;

        if (raw.type === "waitFor") {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: raw.satisfied === true,
                  satisfied: raw.satisfied,
                  matchedConditions: raw.matchedConditions,
                  totalConditions: raw.totalConditions,
                  timestamp: raw.timestamp
                })
              }
            ]
          };
        }

        const err = raw as unknown as { result?: string; error?: string };

        return buildErrorResult(
          err.result ?? err.error ?? "ACTION_FAILED",
          "waitFor returned no result data"
        );
      } catch (err) {
        return buildErrorResult(
          "COMMAND_FAILED",
          err instanceof Error ? err.message : "waitFor failed"
        );
      }
    }

    if (toolName === "scroll") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (typeof args?.id !== "string" || args.id.length === 0) {
        return buildErrorResult(
          "INVALID_ARGUMENT",
          "id is required and must be a non-empty string"
        );
      }

      try {
        const requestPayload: Record<string, unknown> = {
          type: "scroll",
          requestId: makeRequestId(),
          targetId: args.id
        };

        if (typeof args.direction === "string" && ["up", "down", "left", "right"].includes(args.direction)) {
          requestPayload.direction = args.direction;
        }

        if (typeof args.amount === "number" && args.amount > 0) {
          requestPayload.amount = args.amount;
        }

        if (typeof args.targetId === "string" && args.targetId.length > 0) {
          requestPayload.targetId = args.targetId;
        }

        const response = await session.sendCommand(
          requestPayload as unknown as AgentUIBridgeCommandRequest
        );

        const raw = response as unknown as Record<string, unknown>;

        if (raw.type === "scroll") {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: raw.result === "OK",
                  id: raw.targetId,
                  offset: raw.offset,
                  visibleRange: raw.visibleRange,
                  timestamp: raw.timestamp
                })
              }
            ]
          };
        }

        const err = raw as unknown as { result?: string; error?: string };
        const code = err.result ?? err.error ?? "ACTION_FAILED";

        if (code === "NOT_SCROLL_CONTAINER") {
          return buildErrorResult("NOT_SCROLL_CONTAINER", `node '${args.id}' is not a scroll container`);
        }

        if (code === "DIRECTION_UNSUPPORTED") {
          return buildErrorResult("DIRECTION_UNSUPPORTED", `scroll direction '${String(args.direction)}' is not supported`);
        }

        return buildErrorResult(code, `scroll on '${args.id}' failed`);
      } catch (err) {
        return buildErrorResult(
          "COMMAND_FAILED",
          err instanceof Error ? err.message : "scroll failed"
        );
      }
    }

    if (toolName === "navigate") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (typeof args?.screen !== "string" && typeof args?.route !== "string") {
        return buildErrorResult(
          "INVALID_ARGUMENT",
          "at least one of screen or route is required"
        );
      }

      try {
        const requestPayload: Record<string, unknown> = {
          type: "navigate",
          requestId: makeRequestId()
        };

        if (typeof args.screen === "string" && args.screen.length > 0) {
          requestPayload.screen = args.screen;
        }

        if (typeof args.route === "string" && args.route.length > 0) {
          requestPayload.route = args.route;
        }

        if (args.params !== undefined && typeof args.params === "object" && args.params !== null) {
          requestPayload.params = args.params;
        }

        if (typeof args.replace === "boolean") {
          requestPayload.replace = args.replace;
        }

        const response = await session.sendCommand(
          requestPayload as unknown as AgentUIBridgeCommandRequest
        );

        const raw = response as unknown as Record<string, unknown>;

        if (raw.type === "navigate") {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: raw.result === "OK",
                  currentScreen: raw.currentScreen,
                  route: raw.route,
                  timestamp: raw.timestamp
                })
              }
            ]
          };
        }

        const err = raw as unknown as { result?: string; error?: string };
        const code = err.result ?? err.error ?? "ACTION_FAILED";

        if (code === "NAVIGATION_UNAVAILABLE") {
          return buildErrorResult("NAVIGATION_UNAVAILABLE", "navigation is not available in the connected app session");
        }

        if (code === "ROUTE_NOT_FOUND") {
          return buildErrorResult("ROUTE_NOT_FOUND", `route or screen '${String(args.screen ?? args.route)}' was not found`);
        }

        return buildErrorResult(code, "navigate failed");
      } catch (err) {
        return buildErrorResult(
          "COMMAND_FAILED",
          err instanceof Error ? err.message : "navigate failed"
        );
      }
    }

    if (toolName === "runFlow") {
      const args = request.params.arguments as Record<string, unknown> | undefined;

      if (
        Array.isArray(args?.steps) &&
        args.steps.length > 0 &&
        !args.steps.every(
          (s: unknown) =>
            typeof s === "object" &&
            s !== null &&
            typeof (s as Record<string, unknown>).type === "string" &&
            ["tap", "input", "scroll", "navigate", "waitFor", "assert", "observeEvents"].includes((s as Record<string, unknown>).type as string)
        )
      ) {
        return buildErrorResult(
          "INVALID_ARGUMENT",
          "each step must have a valid type (tap, input, scroll, navigate, waitFor, assert, observeEvents)"
        );
      }

      try {
        const requestPayload: Record<string, unknown> = {
          type: "runFlow",
          requestId: makeRequestId()
        };

        if (typeof args?.name === "string" && args.name.length > 0) {
          requestPayload.name = args.name;
        }

        if (Array.isArray(args?.steps)) {
          requestPayload.steps = args.steps;
        }

        if (typeof args?.stopOnFailure === "boolean") {
          requestPayload.stopOnFailure = args.stopOnFailure;
        } else {
          requestPayload.stopOnFailure = true;
        }

        const response = await session.sendCommand(
          requestPayload as unknown as AgentUIBridgeCommandRequest
        );

        const raw = response as unknown as Record<string, unknown>;

        if (raw.type === "runFlow") {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  ok: raw.result === "OK" || raw.completed === true,
                  flow: raw.flow ?? raw.name,
                  completed: raw.completed,
                  steps: raw.steps,
                  stepCount: raw.stepCount,
                  failedStep: raw.failedStep,
                  timestamp: raw.timestamp
                })
              }
            ]
          };
        }

        const err = raw as unknown as { result?: string; error?: string };
        const code = err.result ?? err.error ?? "ACTION_FAILED";

        if (code === "FLOW_NOT_FOUND") {
          return buildErrorResult("FLOW_NOT_FOUND", `flow '${String(args?.name ?? "unnamed")}' was not found`);
        }

        if (code === "STEP_FAILED") {
          return buildErrorResult("STEP_FAILED", "one or more flow steps failed");
        }

        if (code === "TIMEOUT") {
          return buildErrorResult("TIMEOUT", "flow execution timed out");
        }

        return buildErrorResult(code, "runFlow failed");
      } catch (err) {
        return buildErrorResult(
          "COMMAND_FAILED",
          err instanceof Error ? err.message : "runFlow failed"
        );
      }
    }

    return buildErrorResult(
      "UNKNOWN_TOOL",
      `tool '${toolName}' is not registered`
    );
  });

  void server.connect(transport);

  return server;
}

export async function startAgentUIMcpServer(
  options?: AgentUIMcpServerOptions
): Promise<void> {
  const pairingToken = options?.pairingToken ?? generatePairingToken();
  const listener = createAgentUIMcpListener({
    host: options?.host ?? "127.0.0.1",
    port: options?.port ?? 9721,
    expectedPairingToken: pairingToken
  });

  const transport = new StdioServerTransport();

  process.stderr.write(
    `[agent-ui-mcp] starting listener on ${listener.host}:${listener.port}\n`
  );
  process.stderr.write(
    `[agent-ui-mcp] pairing token: ${pairingToken}\n`
  );

  await listener.start();

  process.stderr.write(`[agent-ui-mcp] listener started\n`);

  const server = createAgentUIMcpServer(listener, transport);

  const cleanup = async () => {
    process.stderr.write(`[agent-ui-mcp] shutting down\n`);

    try {
      await server.close();
    } catch {
      // ignore
    }

    try {
      await listener.close();
    } catch {
      // ignore
    }

    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  process.stderr.write(`[agent-ui-mcp] server connected via stdio\n`);
}

function isMain(): boolean {
  const script = process.argv[1];

  if (script === undefined) {
    return false;
  }

  return (
    process.argv.length >= 2 &&
    (script.endsWith("cli.js") ||
      script.endsWith("cli.ts") ||
      script.endsWith("agent-ui-mcp"))
  );
}

if (isMain()) {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    process.stdout.write("agent-ui-mcp: Expo Agent UI local MCP server\n");
    process.stdout.write(
      "Start with: npx @agent-ui/mcp-server\n"
    );
    process.stdout.write(
      "The server starts an MCP stdio transport and a local WebSocket listener.\n"
    );
    process.stdout.write(
      "Connect a development Expo app to the WebSocket listener with the pairing token.\n"
    );
    process.exit(0);
  }

  startAgentUIMcpServer().catch((err) => {
    process.stderr.write(
      `[agent-ui-mcp] fatal: ${err instanceof Error ? err.message : String(err)}\n`
    );
    process.exit(1);
  });
}
