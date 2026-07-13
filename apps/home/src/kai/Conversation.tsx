import { useCallback, useEffect, useRef } from 'react';
import { PromptInput, TypingText } from '@kevinos/ui';
import { KaiPresence } from './KaiPresence.js';
import type { Message } from './simulate.js';

function Bubble({
  message,
  typing,
  onDone,
}: {
  message: Message;
  typing: boolean;
  onDone: () => void;
}) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <KaiPresence size="sm" />}
      <div
        className={[
          'max-w-[42ch] animate-rise whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed',
          isUser ? 'bg-accent-subtle text-text' : 'border border-border bg-surface text-text',
        ].join(' ')}
      >
        {typing ? <TypingText text={message.text} cps={55} onDone={onDone} /> : message.text}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <KaiPresence size="sm" />
      <span className="flex items-center gap-1 text-sm text-text-muted">
        <span className="animate-breathe">KAI réfléchit…</span>
      </span>
    </div>
  );
}

/**
 * Le fil de conversation avec KAI. La **dernière** réponse s'écrit
 * progressivement (signature vivante, Règle 9). Un retour discret ramène à
 * l'accueil vivant.
 */
export function Conversation({
  messages,
  thinking,
  onSend,
  onHome,
}: {
  messages: Message[];
  thinking: boolean;
  onSend: (text: string) => void;
  onHome: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, thinking, scrollToBottom]);

  const lastIndex = messages.length - 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center pb-2">
        <button
          type="button"
          onClick={onHome}
          className="rounded-full px-2.5 py-1.5 text-sm text-text-muted transition duration-fast ease-out hover:bg-hover hover:text-text focus-visible:shadow-focus focus-visible:outline-none"
        >
          <span aria-hidden="true">←</span> Accueil
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4">
        {messages.map((m, i) => (
          <Bubble
            key={m.id}
            message={m}
            typing={m.role === 'kai' && i === lastIndex && !thinking}
            onDone={scrollToBottom}
          />
        ))}
        {thinking && <Thinking />}
        <div ref={bottomRef} />
      </div>

      <div className="pt-2">
        <PromptInput onSubmit={onSend} busy={thinking} autoFocus />
      </div>
    </div>
  );
}
