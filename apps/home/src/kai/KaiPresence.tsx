/**
 * La **présence** de KAI — un orbe calme qui respire, cerné d'un halo discret
 * (Règle 9). Ce n'est pas un logo : c'est le signe qu'une intelligence est déjà
 * là, même sans interaction. Les animations se figent en `prefers-reduced-motion`.
 */
export function KaiPresence({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const orb = size === 'lg' ? 'h-16 w-16 text-3xl' : 'h-9 w-9 text-lg';
  const halo = size === 'lg' ? 'h-20 w-20' : 'h-11 w-11';
  return (
    <span className="relative grid shrink-0 place-items-center" aria-hidden="true">
      <span className={`absolute rounded-full bg-accent-subtle blur-xl animate-halo ${halo}`} />
      <span
        className={`relative grid place-items-center rounded-full bg-accent-subtle text-accent animate-breathe ${orb}`}
      >
        ✦
      </span>
    </span>
  );
}
