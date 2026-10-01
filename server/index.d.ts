import type { Server } from 'node:http';

export interface NeibourlyServerOptions {
  /** Gemini key. Never reaches the browser; empty disables the proxy. */
  apiKey?: string;
  model?: string;
  staticDir?: string;
}

/** Creates the optional static host + Gemini proxy. Call `.listen()` yourself. */
export function createNeibourlyServer(options?: NeibourlyServerOptions): Server;
