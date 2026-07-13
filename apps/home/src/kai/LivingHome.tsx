import { type CSSProperties } from 'react';
import { InsightCard, PromptInput, TypingText } from '@kevinos/ui';
import { KaiPresence } from './KaiPresence.js';
import type { Snapshot } from './environment.js';

/** Retard d'apparition (ms) → style d'animation « rise ». */
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

const WORDS = ['aucun', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept'];

function noticedLine(n: number): string {
  if (n === 0) return 'Rien de particulier aujourd’hui — tout est en ordre.';
  const word = n < WORDS.length ? WORDS[n] : String(n);
  return `J’ai remarqué ${word} élément${n > 1 ? 's' : ''} qui pourraient t’intéresser.`;
}

/**
 * L'accueil **vivant** de KevinOS (Règle 9). Ce n'est pas un tableau de bord :
 * KAI est présent (il respire), il **raconte** la journée, met en avant ce qui
 * compte, puis propose. Tout apparaît **progressivement** — on doit sentir
 * qu'une intelligence nous attendait.
 */
export function LivingHome({
  snapshot,
  onSend,
  busy,
}: {
  snapshot: Snapshot;
  onSend: (text: string) => void;
  busy: boolean;
}) {
  const { greeting, noticed, insights, suggestions } = snapshot;
  const cardsStart = 560;
  const promptDelay = cardsStart + insights.length * 90 + 120;

  return (
    <div className="flex flex-1 flex-col gap-9 overflow-y-auto py-6">
      {/* Présence + salut qui raconte */}
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
          <p className="animate-rise text-lg text-text-secondary" style={delay(260)}>
            {greeting.summary}
          </p>
          <p className="animate-rise text-text-muted" style={delay(380)}>
            <TypingText text={noticedLine(noticed)} startDelay={780} cps={38} />
          </p>
        </div>
      </header>

      {/* Ce que KAI met en avant — cartes glanceable, actionnables */}
      <section aria-label="Aperçu de ta journée" className="grid gap-3 sm:grid-cols-2">
        {insights.map((it, i) => (
          <div key={it.id} className="animate-rise" style={delay(cardsStart + i * 90)}>
            <InsightCard
              icon={it.icon}
              label={it.label}
              value={it.value}
              {...(it.meta ? { meta: it.meta } : {})}
              {...(it.accent ? { accent: it.accent } : {})}
              onActivate={() => onSend(it.prompt)}
            />
          </div>
        ))}
      </section>

      {/* La conversation — centrale, mais plus seule */}
      <div className="animate-rise" style={delay(promptDelay)}>
        <PromptInput
          onSubmit={onSend}
          busy={busy}
          placeholder="Parle à KAI, ou touche une carte ci-dessus…"
        />
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
      </div>
    </div>
  );
}
