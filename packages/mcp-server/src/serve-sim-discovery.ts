/**
 * serve-sim session discovery.
 *
 * Reads serve-sim helper state files from the OS temp directory to discover
 * running iOS Simulator preview sessions.  This is a read-only, optional
 * integration — serve-sim is never required and is not added as a dependency.
 *
 * serve-sim writes one JSON state file per device helper to:
 *   `$TMPDIR/serve-sim/server-<udid>.json`   (macOS)
 *
 * Each file contains:
 *   { pid, port, device, url, streamUrl, wsUrl }
 *
 * This module mirrors the discovery logic from serve-sim's own middleware
 * (packages/serve-sim/src/middleware.ts) but keeps it strictly read-only.
 * We intentionally do NOT proxy serve-sim's /exec endpoint or any write
 * operations — only state discovery is exposed.
 *
 * On Windows or when serve-sim is not running, discovery gracefully returns
 * an empty array.
 *
 * @see https://github.com/EvanBacon/serve-sim
 */

import { readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Shape of a single serve-sim helper state file.
 * Matches the `ServeSimState` interface from serve-sim's middleware.
 */
export interface ServeSimHelperState {
  /** PID of the running serve-sim Swift helper process. */
  pid: number;
  /** HTTP port the helper is listening on. */
  port: number;
  /** Simulator UDID this helper is bound to. */
  device: string;
  /** Base URL for the helper server (e.g. "http://localhost:3100"). */
  url: string;
  /** MJPEG stream URL (e.g. "http://localhost:3100/stream"). */
  streamUrl: string;
  /** WebSocket control channel URL (e.g. "ws://localhost:3100/ws"). */
  wsUrl: string;
}

/**
 * A discovered serve-sim session with validated liveness.
 */
export interface ServeSimSession {
  /** Simulator UDID. */
  device: string;
  /** HTTP port the helper is listening on. */
  port: number;
  /** MJPEG stream URL for the simulator framebuffer. */
  streamUrl: string;
  /** WebSocket control channel URL for touch/gesture input. */
  wsUrl: string;
  /** Base URL for the helper server. */
  url: string;
  /** PID of the helper process (for diagnostics only). */
  pid: number;
}

/**
 * Result of serve-sim session discovery.
 */
export interface ServeSimDiscoveryResult {
  /** Whether the current platform supports serve-sim (macOS only). */
  platformSupported: boolean;
  /** Whether the serve-sim state directory exists. */
  stateDirectoryExists: boolean;
  /** Discovered live sessions. */
  sessions: ServeSimSession[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SERVE_SIM_STATE_DIR_NAME = "serve-sim";
const STATE_FILE_PREFIX = "server-";
const STATE_FILE_SUFFIX = ".json";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getServeSimStateDir(): string {
  return join(tmpdir(), SERVE_SIM_STATE_DIR_NAME);
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function parseStateFile(filePath: string): ServeSimHelperState | null {
  try {
    const raw = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.pid !== "number" ||
      typeof parsed.port !== "number" ||
      typeof parsed.device !== "string" ||
      typeof parsed.url !== "string" ||
      typeof parsed.streamUrl !== "string" ||
      typeof parsed.wsUrl !== "string"
    ) {
      return null;
    }

    return parsed as ServeSimHelperState;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Discover running serve-sim sessions by reading state files from the temp
 * directory.  Returns an empty result on non-macOS platforms or when
 * serve-sim is not installed / not running.
 *
 * This function is designed to be called on every resource read — it is
 * lightweight (directory listing + JSON parse + kill(pid, 0) per file) and
 * completes synchronously.
 */
export function discoverServeSimSessions(): ServeSimDiscoveryResult {
  // serve-sim is macOS-only (requires xcrun simctl).
  // On other platforms, return a clean "not supported" result.
  const platformSupported = process.platform === "darwin";

  if (!platformSupported) {
    return {
      platformSupported: false,
      stateDirectoryExists: false,
      sessions: []
    };
  }

  const stateDir = getServeSimStateDir();

  let files: string[];

  try {
    files = readdirSync(stateDir).filter(
      (f) =>
        f.startsWith(STATE_FILE_PREFIX) && f.endsWith(STATE_FILE_SUFFIX)
    );
  } catch {
    // Directory does not exist or is not readable — serve-sim not running.
    return {
      platformSupported: true,
      stateDirectoryExists: false,
      sessions: []
    };
  }

  const sessions: ServeSimSession[] = [];

  for (const file of files) {
    const filePath = join(stateDir, file);
    const state = parseStateFile(filePath);

    if (!state) {
      continue;
    }

    // Validate the helper process is still alive.
    if (!isProcessAlive(state.pid)) {
      continue;
    }

    sessions.push({
      device: state.device,
      port: state.port,
      streamUrl: state.streamUrl,
      wsUrl: state.wsUrl,
      url: state.url,
      pid: state.pid
    });
  }

  return {
    platformSupported: true,
    stateDirectoryExists: true,
    sessions
  };
}
