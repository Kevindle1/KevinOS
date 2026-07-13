import { useEffect, useRef } from 'react';
import { PromptInput, Spinner } from '@kevinos/ui';
import { useSimulatedKai, type Message } from './simulate.js';

/** Marque visuelle de KAI — orbe calme aux couleurs signature. */
function KaiMark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-14 w-14 text-2xl' : 'h-8 w-8 text-base';
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-accent-subtle text-accent ${dim}`}
    >
      ✦
    </span>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <KaiMark />}
      <div
        className={[
          'max-w-[42ch] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed',
          isUser ? 'bg-accent-subtle text-text' : 'border border-border bg-surface text-text',
        ].join(' ')}
      >
        {message.text}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <KaiMark />
      <span className="flex items-center gap-2 text-sm text-text-muted">
        <Spinner size="sm" label="" />
        KAI réfléchit…
      </span>
    </div>
  );
}

const SUGGESTIONS = [
  'Montre-moi mes dernières photos',
  'Où en est le serveur ?',
  'Reprendre un film',
] as const;

/**
 * L'expérience de conversation de Home — construite **autour de KAI**
 * (ADR-0017 / Règle 0). Vide, c'est un accueil calme ; dès le premier message,
 * c'est un fil vivant. KAI est simulé (itération 1) — le vrai KAI se branchera
 * au même `onSubmit` sans rien changer ici.
 */
export function KaiConversation() {
  const { messages, thinking, send } = useSimulatedKai();
  const started = messages.length > 0;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, thinking]);

  if (!started) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <div className="flex flex-col items-center gap-5">
          <KaiMark size="lg" />
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Bonjour Kevin <span aria-hidden="true">👋</span>
            </h1>
            <p className="text-lg text-text-secondary">Comment puis-je t’aider aujourd’hui ?</p>
          </div>
        </div>

        <div className="w-full">
          <PromptInput onSubmit={send} busy={thinking} autoFocus />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-border px-3.5 py-1.5 text-sm text-text-secondary transition duration-fast ease-out hover:border-border-strong hover:bg-hover hover:text-text focus-visible:shadow-focus focus-visible:outline-none"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
        {thinking && <Thinking />}
        <div ref={bottomRef} />
      </div>
      <div className="pt-2">
        <PromptInput onSubmit={send} busy={thinking} autoFocus />
      </div>
    </div>
  );
}
