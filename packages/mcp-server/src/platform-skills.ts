import { readFileSync } from "node:fs";
import { resolve as pathResolve, sep, normalize } from "node:path";

const MAX_RESOURCE_BYTES = 262144; // 256 KiB

export interface PlatformSkillResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  relativePath: string;
}

export interface PlatformSkillEntry {
  name: string;
  description: string;
  resourceUri: string;
}

export interface PlatformSkillContent {
  name: string;
  uri: string;
  mimeType: string;
  text: string;
  byteLength: number;
  truncated: boolean;
  maxBytes: number;
}

const SKILL_DESCRIPTIONS: Record<string, string> = {
  "android-ecosystem-skill":
    "Android ecosystem, Jetpack Compose adapter, Material 3, Gradle/AGP, Android performance, Play release.",
  "apple-ecosystem-app-building":
    "Apple ecosystem, SwiftUI adapter, Xcode, SwiftUI/UIKit, Apple performance, App Store release.",
  "context-prompt-engineering":
    "Prompt resources, task notes, agent workflows, handoffs, review notes, validation plans.",
  "expo-skill":
    "Expo app structure, Expo Router, config plugins, EAS, dev clients, Expo UI, Expo Modules, deployment.",
  "native-accessibility-engineering":
    "VoiceOver, TalkBack, Dynamic Type, Switch Access, React Native/SwiftUI/Compose semantics.",
  "native-app-design-engineering":
    "Native-feeling polish, motion, haptics, transitions, reduced motion, platform UI feel.",
  "systematic-debugging":
    "Root-cause-first debugging, TTD/TDD red-green evidence, blocked verification triage.",
  "vercel-react-native-skills":
    "React Native components, lists, images, animations, native deps, performance, monorepo guidance.",
  "vercel-composition-patterns":
    "Component APIs, provider/context shape, compound components, avoiding boolean prop drift."
};

const INDEX_RESOURCE: PlatformSkillResource = {
  uri: "agent-ui://platform-skills/index",
  name: "Platform Skills Index",
  description:
    "Catalog of available repo-local platform skills and loading rules.",
  mimeType: "text/markdown",
  relativePath: "platform-skills/INDEX.md"
};

const ROUTING_RESOURCE: PlatformSkillResource = {
  uri: "agent-ui://platform-skills/routing",
  name: "Platform Skill Routing",
  description:
    "The router that maps tasks to skills for Expo Agent UI.",
  mimeType: "text/markdown",
  relativePath: "platform-skill-routing.md"
};

export function getPlatformSkillResourceUris(): PlatformSkillResource[] {
  const skillNames = Object.keys(SKILL_DESCRIPTIONS);

  const skillResources: PlatformSkillResource[] = skillNames.map(
    (name) => ({
      uri: `agent-ui://platform-skills/${name}`,
      name: name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      description: SKILL_DESCRIPTIONS[name] ?? "",
      mimeType: "text/markdown",
      relativePath: `platform-skills/${name}/SKILL.md`
    })
  );

  return [INDEX_RESOURCE, ROUTING_RESOURCE, ...skillResources];
}

export function listPlatformSkillEntries(): PlatformSkillEntry[] {
  const skillNames = Object.keys(SKILL_DESCRIPTIONS);

  return skillNames.map((name) => ({
    name,
    description: SKILL_DESCRIPTIONS[name] ?? "",
    resourceUri: `agent-ui://platform-skills/${name}`
  }));
}

export function getResourceMetadata(
  uri: string
): PlatformSkillResource | undefined {
  return getPlatformSkillResourceUris().find((r) => r.uri === uri);
}

export function createPlatformSkillResolver(baseDir: string) {
  const normalizedBase = normalize(pathResolve(baseDir));

  function resolveUri(uri: string): string | undefined {
    const resource = getPlatformSkillResourceUris().find((r) => r.uri === uri);

    if (!resource) {
      return undefined;
    }

    const relativePath = resource.relativePath;
    const absolutePath = pathResolve(normalizedBase, relativePath);
    const normalizedPath = normalize(absolutePath);

    // Must stay inside the base directory
    if (
      !normalizedPath.startsWith(normalizedBase + sep) &&
      normalizedPath !== normalizedBase
    ) {
      return undefined;
    }

    return normalizedPath;
  }

  function readUri(
    uri: string
  ):
    | { content: PlatformSkillContent }
    | { error: string; code: string } {
    const absolutePath = resolveUri(uri);

    if (!absolutePath) {
      return { error: "resource not found", code: "RESOURCE_NOT_FOUND" };
    }

    try {
      const content = readFileSync(absolutePath, "utf8");
      const byteLength = Buffer.byteLength(content, "utf8");

      if (byteLength > MAX_RESOURCE_BYTES) {
        const truncated = content.slice(
          0,
          Math.floor(MAX_RESOURCE_BYTES * 0.75)
        );

        return {
          content: {
            name: uri,
            uri,
            mimeType: "text/markdown",
            text: `${truncated}\n\n[truncated: ${byteLength} total bytes]`,
            byteLength,
            truncated: true,
            maxBytes: MAX_RESOURCE_BYTES
          }
        };
      }

      const resource = getResourceMetadata(uri);

      return {
        content: {
          name: resource?.name ?? uri,
          uri,
          mimeType: resource?.mimeType ?? "text/plain",
          text: content,
          byteLength,
          truncated: false,
          maxBytes: MAX_RESOURCE_BYTES
        }
      };
    } catch {
      return { error: "failed to read resource file", code: "RESOURCE_READ_FAILED" };
    }
  }

  function getSkillContent(
    name: string
  ):
    | { content: PlatformSkillContent }
    | { error: string; code: string } {
    if (!SKILL_DESCRIPTIONS[name]) {
      return { error: `skill '${name}' not found`, code: "SKILL_NOT_FOUND" };
    }

    const uri = `agent-ui://platform-skills/${name}`;

    return readUri(uri);
  }

  function getSkillDir(name: string): string | undefined {
    if (!SKILL_DESCRIPTIONS[name]) {
      return undefined;
    }

    const relativePath = `${name}/SKILL.md`;
    const absolutePath = pathResolve(normalizedBase, relativePath);
    const normalizedPath = normalize(absolutePath);

    if (
      !normalizedPath.startsWith(normalizedBase + sep) &&
      normalizedPath !== normalizedBase
    ) {
      return undefined;
    }

    return normalizedPath;
  }

  return { resolveUri, readUri, getSkillContent, getSkillDir };
}

export type PlatformSkillResolver = ReturnType<
  typeof createPlatformSkillResolver
>;

export interface PlatformSkillSearchMatch {
  skill: string;
  score: number;
  snippet?: string | undefined;
}

export interface PlatformSkillSearchOptions {
  skillNames?: string[] | undefined;
  limit?: number | undefined;
  includeSnippets?: boolean | undefined;
}

export function searchPlatformSkills(
  query: string,
  options?: PlatformSkillSearchOptions
): PlatformSkillSearchMatch[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const names = options?.skillNames != null
    ? Object.keys(SKILL_DESCRIPTIONS).filter((n) => options.skillNames!.includes(n))
    : Object.keys(SKILL_DESCRIPTIONS);

  const matches: PlatformSkillSearchMatch[] = [];

  for (const name of names) {
    const description = SKILL_DESCRIPTIONS[name] ?? "";
    const searchText = `${name} ${description}`.toLowerCase();
    let score = 0;

    for (const term of terms) {
      if (name.toLowerCase().includes(term)) {
        score += 10;
      }

      if (description.toLowerCase().includes(term)) {
        score += 5;
      }

      if (searchText.split(/\s+/).some((w) => w.startsWith(term))) {
        score += 3;
      }
    }

    if (score > 0) {
      const match: PlatformSkillSearchMatch = { skill: name, score };

      if (options?.includeSnippets) {
        const firstTerm = terms[0] ?? "";
        const snippetStart = description.toLowerCase().indexOf(firstTerm);
        const snippetLen = 120;

        if (snippetStart >= 0) {
          match.snippet = description.slice(
            Math.max(0, snippetStart - 20),
            snippetStart + snippetLen
          );
        } else {
          match.snippet = description.slice(0, snippetLen);
        }
      }

      matches.push(match);
    }
  }

  matches.sort((a, b) => b.score - a.score);

  if (typeof options?.limit === "number" && options.limit > 0) {
    return matches.slice(0, options.limit);
  }

  return matches;
}

export interface PlatformSkillRecommendation {
  skill: string;
  resourceUri: string;
  reasons: string[];
  warnings: string[];
}

export interface PlatformSkillRecommendOptions {
  stage?: string | undefined;
  platforms?: string[] | undefined;
  scaffoldIntent?: string | undefined;
}

const RECOMMEND_KEYWORDS: Record<string, string[]> = {
  "context-prompt-engineering": ["prompt", "prompts", "workflow", "handoff", "notes", "review", "validation", "plan", "task"],
  "systematic-debugging": ["debug", "debugging", "bug", "fix", "test", "failure", "error", "verification", "root cause"],
  "expo-skill": ["expo", "eas", "expo router", "config plugin", "ota", "dev client", "expo ui", "expo modules"],
  "vercel-react-native-skills": ["react native", "component", "list", "flatlist", "image", "performance", "animation", "native module"],
  "vercel-composition-patterns": ["composition", "component api", "compound", "provider", "abstraction", "pattern"],
  "native-accessibility-engineering": ["accessibility", "a11y", "voiceover", "talkback", "semantics", "dynamic type", "screen reader"],
  "native-app-design-engineering": ["design", "motion", "animation", "haptic", "polish", "ui feel", "transition", "gesture"],
  "android-ecosystem-skill": ["android", "compose", "jetpack", "gradle", "agp", "material", "play store"],
  "apple-ecosystem-app-building": ["ios", "swiftui", "xcode", "apple", "uikit", "app store", "macos"]
};

const STAGE_KEYWORDS: Record<string, string[]> = {
  "0": ["repo", "reset", "cleanup"],
  "1": ["package", "workspace", "npm", "typecheck", "build", "scripts"],
  "2": ["primitive", "component", "jsx", "button", "text", "image", "list"],
  "3": ["semantic", "registry", "tree", "node", "redaction"],
  "4": ["bridge", "websocket", "session", "pairing", "loopback"],
  "5": ["mcp", "server", "tool", "resource", "prompt", "stdio"],
  "6": ["motion", "reanimated", "reduce motion", "transition", "gesture"],
  "7": ["adapter", "swiftui", "compose", "native adapter", "platform adapter"],
  "8": ["skill", "agent skill", "mcp surface", "agent knowledge"],
  "9": ["flow", "runner", "patch", "preview", "comparison", "maestro"],
  "10": ["publish", "readme", "compatibility", "install", "release"]
};

export function recommendPlatformSkills(
  task: string,
  options?: PlatformSkillRecommendOptions
): PlatformSkillRecommendation[] {
  if (!task || task.trim().length === 0) {
    return [];
  }

  const taskLower = task.toLowerCase();
  const results: PlatformSkillRecommendation[] = [];

  for (const [skillName, keywords] of Object.entries(RECOMMEND_KEYWORDS)) {
    const reasons: string[] = [];

    for (const keyword of keywords) {
      if (taskLower.includes(keyword)) {
        reasons.push(`task contains keyword '${keyword}'`);
      }
    }

    if (options?.scaffoldIntent != null) {
      const intentLower = options.scaffoldIntent.toLowerCase();
      const skillWords = skillName.replace(/-/g, " ");

      if (
        intentLower.includes(skillWords) ||
        keywords.some((kw) => intentLower.includes(kw))
      ) {
        reasons.push(`scaffold intent matches skill '${skillName}'`);
      }
    }

    if (options?.stage != null) {
      const stageStr = String(options.stage);
      const stageKeywords = STAGE_KEYWORDS[stageStr];

      if (stageKeywords) {
        for (const kw of stageKeywords) {
          if (taskLower.includes(kw)) {
            reasons.push(`stage ${stageStr} keyword '${kw}' matches task`);
          }
        }
      }
    }

    if (
      options?.platforms?.some((p: string) =>
        taskLower.includes(p.toLowerCase())
      ) &&
      (skillName === "android-ecosystem-skill" || skillName === "apple-ecosystem-app-building")
    ) {
      reasons.push(`platform in task matches skill '${skillName}'`);
    }

    if (reasons.length > 0) {
      const warnings: string[] = [];

      if (skillName === "apple-ecosystem-app-building" && !taskLower.includes("ios") && !taskLower.includes("apple") && !taskLower.includes("swiftui")) {
        warnings.push("Apple ecosystem skill loaded but no explicit iOS/Apple/SwiftUI reference found");
      }

      if (skillName === "android-ecosystem-skill" && !taskLower.includes("android") && !taskLower.includes("compose") && !taskLower.includes("jetpack")) {
        warnings.push("Android ecosystem skill loaded but no explicit Android/Compose/Jetpack reference found");
      }

      results.push({
        skill: skillName,
        resourceUri: `agent-ui://platform-skills/${skillName}`,
        reasons,
        warnings
      });
    }
  }

  return results;
}
