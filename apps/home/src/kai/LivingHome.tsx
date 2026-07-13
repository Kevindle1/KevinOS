import { useEffect, useState, type CSSProperties } from 'react';
import { Banner, Button, InsightCard, PromptInput, TypingText, cx } from '@kevinos/ui';
import { KaiPresence } from './KaiPresence.js';
import type { HomeState } from './environment.js';

/** Retard d'apparition (ms) → animation « rise ». */
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/**
 * L'accueil **vivant** et **minimal** de KevinOS (Règle 9, itération 3).
 *
 * KAI ne montre pas tout : il **choisit** le peu qui compte maintenant (≤ 3
 * cartes, classées). Au repos, l'écran **respire** — présence, une phrase, très
 * peu d'informations. Puis KevinOS « prend la parole » : un rappel discret
 * apparaît. On doit sentir qu'une intelligence **vit avec** Kevin.
 */
export function LivingHome({
  state,
  onSend,
  busy,
}: {
  state: HomeState;
  onSend: (text: string) => void;
  busy: boolean;
}) {
  const { greeting, headline, cards, suggestions, calm, nudge } = state;
  const [nudgeShown, setNudgeShown] = useState(false);
  const [nudgeClosed, setNudgeClosed] = useState(false);

  // « Prise de parole » : après un moment calme, KAI se manifeste doucement.
  useEffect(() => {
    if (!nudge) return;
    const t = window.setTimeout(() => setNudgeShown(true), 5200);
    return () => window.clearTimeout(t);
  }, [nudge]);

  const cardsStart = 520;
  const promptDelay = cardsStart + cards.length * 90 + 160;

  return (
    <div
      className={cx(
        'flex flex-1 flex-col items-center gap-9 overflow-y-auto py-8',
        calm && 'justify-center',
      )}
    >
      {/* Présence + voix de KAI */}
      <header className="flex flex-col items-center gap-5 text-center">
        <span className="animate-fade" style={delay(0)}>
          <KaiPresence size="lg" />
        </span>
        <div className="space-y-2">
          <h1
            className="animate-rise text-3xl font-semibold tracking-tight text-text sm:text-4xl"
            style={delay(140)}
          >
            {greeting.salutation} Kevin <span aria-hidden="true">{greeting.emoji}</span>
          </h1>
          <p className="animate-rise text-lg text-text-secondary" style={delay(300)}>
            <TypingText text={headline} startDelay={620} cps={38} />
          </p>
        </div>
      </header>

      {/* KevinOS prend la parole — discret, différé, effaçable */}
      {nudge && nudgeShown && !nudgeClosed ? (
        <div className="w-full max-w-md animate-rise">
          <Banner tone="info" onDismiss={() => setNudgeClosed(true)}>
            <span>
              <span aria-hidden="true">{nudge.icon}</span> {nudge.text}
            </span>
            <div className="mt-2">
              <Button size="sm" variant="secondary" onClick={() => onSend(nudge.prompt)}>
                {nudge.action}
              </Button>
            </div>
          </Banner>
        </div>
      ) : null}

      {/* L'essentiel maintenant — peu, classé, jamais un mur */}
      {cards.length > 0 ? (
        <section
          aria-label="L’essentiel maintenant"
          className="flex w-full max-w-md flex-col gap-3"
        >
          {cards.map((c, i) => (
            <div key={c.id} className="animate-rise" style={delay(cardsStart + i * 90)}>
              <InsightCard
                icon={c.icon}
                label={c.label}
                value={c.value}
                {...(c.meta ? { meta: c.meta } : {})}
                {...(c.accent ? { accent: c.accent } : {})}
                emphasis={c.priority === 'high'}
                onActivate={() => onSend(c.prompt)}
              />
            </div>
          ))}
        </section>
      ) : null}

      {/* La conversation — centrale */}
      <div className="w-full max-w-md animate-rise" style={delay(promptDelay)}>
        <PromptInput onSubmit={onSend} busy={busy} placeholder="Parle à KAI…" />
        {suggestions.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSend(s.prompt)}
                className="rounded-full border border-border px-3.5 py-1.5 text-sm text-text-secondary transition duration-fast ease-out hover:border-border-strong hover:bg-hover hover:text-text focus-visible:shadow-focus focus-visible:outline-none"
              >
                <span aria-hidden="true">{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
