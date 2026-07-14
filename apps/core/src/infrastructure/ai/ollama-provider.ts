import type { AIProvider, AICapabilities, ChatChunk, ChatRequest } from '@kevinos/shared';

/**
 * Adaptateur **Ollama** — fournisseur IA **local** (ADR-0006), le seul packagé
 * en V1. KAI ne le connaît pas directement : il ne voit que le port `AIProvider`
 * (remplaçable par configuration). Offline-first : tout tourne sur la machine.
 */
export class OllamaProvider implements AIProvider {
  readonly id = 'local';
  readonly capabilities: AICapabilities = {
    chat: true,
    embeddings: false,
    tools: false,
    vision: false,
  };

  constructor(private readonly opts: { baseUrl: string; model: string }) {}

  async isAvailable(signal?: AbortSignal): Promise<boolean> {
    try {
      const res = await fetch(`${this.opts.baseUrl}/api/tags`, {
        ...(signal ? { signal } : {}),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async *chat(request: ChatRequest): AsyncIterable<ChatChunk> {
    const res = await fetch(`${this.opts.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: request.model ?? this.opts.model,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
        options: request.temperature != null ? { temperature: request.temperature } : {},
      }),
      ...(request.signal ? { signal: request.signal } : {}),
    });

    if (!res.ok || !res.body) {
      throw new Error(`ollama_chat_failed_${res.status}`);
    }

    // Ollama diffuse du NDJSON : une ligne JSON par fragment.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl = buffer.indexOf('\n');
      while (nl !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        nl = buffer.indexOf('\n');
        if (!line) continue;
        const chunk = this.parseLine(line);
        if (chunk) yield chunk;
      }
    }
    const tail = buffer.trim();
    if (tail) {
      const chunk = this.parseLine(tail);
      if (chunk) yield chunk;
    }
  }

  private parseLine(line: string): ChatChunk | null {
    try {
      const json = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
      return { delta: json.message?.content ?? '', done: json.done === true };
    } catch {
      return null;
    }
  }
}
