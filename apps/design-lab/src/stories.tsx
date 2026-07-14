import { useState, type ReactNode } from 'react';
import {
  Button,
  Card,
  Badge,
  Tag,
  StatusIndicator,
  Spinner,
  Skeleton,
  Progress,
  Banner,
  Input,
  SearchInput,
  Textarea,
  PromptInput,
  Checkbox,
  RadioGroup,
  Switch,
  Select,
  ButtonGroup,
  Tooltip,
  Popover,
  Lightbox,
  Avatar,
  IconButton,
  Divider,
  ScrollArea,
  InsightCard,
  TypingText,
  MediaPlayer,
  DocumentPreview,
} from '@kevinos/ui';

export interface Story {
  id: string;
  name: string;
  group: string;
  render: () => ReactNode;
}

/** Disposition simple pour aligner des variantes dans une story. */
function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4">{children}</div>;
}
function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4 max-w-xl">{children}</div>;
}

function TagDemo() {
  const [tags, setTags] = useState(['Vacances', '2024', 'Favoris']);
  return (
    <Row>
      {tags.map((t) => (
        <Tag key={t} onRemove={() => setTags((prev) => prev.filter((x) => x !== t))}>
          {t}
        </Tag>
      ))}
      <Tag>Non supprimable</Tag>
    </Row>
  );
}

function BannerDemo() {
  const [open, setOpen] = useState(true);
  return (
    <Stack>
      <Banner tone="info" title="Mode local">
        Toutes les fonctions restent disponibles hors ligne.
      </Banner>
      <Banner tone="success" title="Sauvegarde terminée">
        Restaurée et vérifiée à 03:30.
      </Banner>
      <Banner tone="warning" title="Espace disque faible">
        Il reste 9 % sur le disque de sauvegarde.
      </Banner>
      {open ? (
        <Banner tone="danger" title="Service injoignable" onDismiss={() => setOpen(false)}>
          KOS Vision ne répond pas. Réessai automatique en cours.
        </Banner>
      ) : (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Réafficher le bandeau
        </Button>
      )}
    </Stack>
  );
}

function SearchDemo() {
  const [v, setV] = useState('');
  const [last, setLast] = useState('');
  return (
    <Stack>
      <SearchInput value={v} onValueChange={setV} onSearch={setLast} placeholder="Rechercher…" />
      <SearchInput defaultValue="" loading placeholder="Chargement…" />
      <p className="text-sm text-text-muted">Dernière recherche (Entrée) : {last || '—'}</p>
    </Stack>
  );
}

function PromptInputDemo() {
  const [log, setLog] = useState<string[]>([]);
  return (
    <Stack>
      <PromptInput
        onSubmit={(v) => setLog((l) => [...l, v])}
        placeholder="Écris à KAI… (Entrée pour envoyer, Maj+Entrée = saut de ligne)"
      />
      <PromptInput value="KAI réfléchit…" busy onSubmit={() => {}} />
      <p className="text-sm text-text-muted">
        Messages envoyés : {log.length ? log.join(' · ') : '—'}
      </p>
    </Stack>
  );
}

function TypingDemo() {
  const [n, setN] = useState(0);
  return (
    <Stack>
      <p className="text-lg text-text">
        <TypingText
          key={n}
          text="Bonsoir Kevin 👋 J’ai remarqué trois éléments qui pourraient t’intéresser."
          cps={38}
        />
      </p>
      <div>
        <Button variant="secondary" size="sm" onClick={() => setN((v) => v + 1)}>
          Rejouer
        </Button>
      </div>
      <p className="text-sm text-text-muted">
        (S’affiche instantanément si « réduire les animations » est activé.)
      </p>
    </Stack>
  );
}

function LightboxDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Ouvrir la visionneuse</Button>
      <Lightbox
        open={open}
        onClose={() => setOpen(false)}
        caption="Une belle image · 14 juillet 2026"
      >
        <div
          className="h-72 w-96 max-w-full rounded-lg"
          style={{ background: 'linear-gradient(135deg,#2FBEB4,#5b7cfa)' }}
        />
      </Lightbox>
    </div>
  );
}

function ChoiceDemo() {
  const [theme, setTheme] = useState('dark');
  const [view, setView] = useState('grid');
  return (
    <Stack>
      <Checkbox label="Se souvenir de moi" defaultChecked />
      <Checkbox label="État indéterminé" indeterminate />
      <Switch label="Notifications" defaultChecked />
      <RadioGroup
        label="Thème"
        orientation="horizontal"
        value={theme}
        onValueChange={setTheme}
        options={[
          { value: 'light', label: 'Clair' },
          { value: 'dark', label: 'Sombre' },
          { value: 'system', label: 'Auto' },
        ]}
      />
      <ButtonGroup
        ariaLabel="Vue"
        value={view}
        onValueChange={setView}
        options={[
          { value: 'grid', label: 'Grille' },
          { value: 'list', label: 'Liste' },
          { value: 'map', label: 'Carte' },
        ]}
      />
    </Stack>
  );
}

export const stories: Story[] = [
  {
    id: 'button',
    name: 'Button',
    group: 'Primitives & feedback',
    render: () => (
      <Stack>
        <Row>
          <Button variant="primary">Primaire</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Row>
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row>
          <Button loading>Chargement</Button>
          <Button disabled>Désactivé</Button>
        </Row>
      </Stack>
    ),
  },
  {
    id: 'card',
    name: 'Card',
    group: 'Primitives & feedback',
    render: () => (
      <Row>
        <Card className="w-64">
          <div className="font-medium">Carte</div>
          <p className="text-sm text-text-secondary mt-1">Surface, contour, rayon lg.</p>
        </Card>
        <Card elevated className="w-64">
          <div className="font-medium">Élevée</div>
          <p className="text-sm text-text-secondary mt-1">Ombre 2, pour les surfaces au-dessus.</p>
        </Card>
        <Card interactive className="w-64" tabIndex={0}>
          <div className="font-medium">Interactive</div>
          <p className="text-sm text-text-secondary mt-1">Survol + focus visibles.</p>
        </Card>
      </Row>
    ),
  },
  {
    id: 'badge',
    name: 'Badge',
    group: 'Primitives & feedback',
    render: () => (
      <Row>
        <Badge>Neutre</Badge>
        <Badge tone="accent" dot>
          Accent
        </Badge>
        <Badge tone="success" dot>
          En ligne
        </Badge>
        <Badge tone="warning" dot>
          À surveiller
        </Badge>
        <Badge tone="danger" dot>
          Hors ligne
        </Badge>
        <Badge tone="info">Info</Badge>
      </Row>
    ),
  },
  { id: 'tag', name: 'Tag', group: 'Primitives & feedback', render: () => <TagDemo /> },
  {
    id: 'status',
    name: 'StatusIndicator',
    group: 'Primitives & feedback',
    render: () => (
      <Row>
        <StatusIndicator status="up" />
        <StatusIndicator status="warning" />
        <StatusIndicator status="down" />
        <StatusIndicator status="unknown" />
      </Row>
    ),
  },
  {
    id: 'spinner',
    name: 'Spinner',
    group: 'Primitives & feedback',
    render: () => (
      <Row>
        <span className="text-accent">
          <Spinner size="sm" />
        </span>
        <span className="text-accent">
          <Spinner size="md" />
        </span>
        <span className="text-accent">
          <Spinner size="lg" />
        </span>
      </Row>
    ),
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    group: 'Primitives & feedback',
    render: () => (
      <Stack>
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" width={40} height={40} />
          <div className="flex flex-col gap-2">
            <Skeleton width={160} height={12} />
            <Skeleton width={100} height={12} />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={64} />
          ))}
        </div>
      </Stack>
    ),
  },
  {
    id: 'progress',
    name: 'Progress',
    group: 'Primitives & feedback',
    render: () => (
      <Stack>
        <Progress value={30} label="30%" />
        <Progress value={70} tone="success" label="70%" />
        <Progress value={92} tone="warning" label="92%" />
        <Progress label="Indéterminé" />
      </Stack>
    ),
  },
  { id: 'banner', name: 'Banner', group: 'Primitives & feedback', render: () => <BannerDemo /> },

  {
    id: 'input',
    name: 'Input',
    group: 'Foundation',
    render: () => (
      <Stack>
        <Input label="Nom" placeholder="Kevin" defaultValue="" help="Votre prénom." />
        <Input label="Recherche" leading={<span>🔍</span>} placeholder="Filtrer…" />
        <Input label="Chargement" loading defaultValue="Synchronisation" />
        <Input label="Email" error="Adresse invalide" defaultValue="kevin@" />
        <Input label="Désactivé" disabled defaultValue="Verrouillé" />
      </Stack>
    ),
  },
  { id: 'search', name: 'SearchInput', group: 'Foundation', render: () => <SearchDemo /> },
  {
    id: 'textarea',
    name: 'Textarea',
    group: 'Foundation',
    render: () => (
      <Stack>
        <Textarea label="Note" placeholder="Écrire…" autoGrow help="La hauteur s'adapte." />
        <Textarea label="Avec erreur" error="Trop court" defaultValue="…" />
      </Stack>
    ),
  },
  {
    id: 'prompt-input',
    name: 'PromptInput',
    group: 'Foundation',
    render: () => <PromptInputDemo />,
  },
  {
    id: 'select',
    name: 'Select',
    group: 'Foundation',
    render: () => (
      <Stack>
        <Select
          label="Trier par"
          placeholder="Choisir…"
          options={[
            { value: 'date', label: 'Date' },
            { value: 'name', label: 'Nom' },
            { value: 'size', label: 'Taille' },
          ]}
        />
      </Stack>
    ),
  },
  {
    id: 'choices',
    name: 'Checkbox · Switch · Radio · ButtonGroup',
    group: 'Foundation',
    render: () => <ChoiceDemo />,
  },

  {
    id: 'tooltip',
    name: 'Tooltip',
    group: 'Surfaces',
    render: () => (
      <Row>
        <Tooltip content="Infobulle discrète (survol ou focus)">
          <Button variant="secondary">Survole-moi</Button>
        </Tooltip>
        <Tooltip content="À droite" placement="right">
          <Button variant="ghost">Placement</Button>
        </Tooltip>
      </Row>
    ),
  },
  {
    id: 'popover',
    name: 'Popover',
    group: 'Surfaces',
    render: () => (
      <Popover
        content={
          <div className="p-1">
            <p className="px-2 py-1 text-sm text-text-secondary">Panneau ancré (focus piégé).</p>
            <Button size="sm" className="w-full">
              Action
            </Button>
          </div>
        }
      >
        <Button>Ouvrir le panneau</Button>
      </Popover>
    ),
  },
  {
    id: 'lightbox',
    name: 'Lightbox',
    group: 'Surfaces',
    render: () => <LightboxDemo />,
  },
  {
    id: 'avatar',
    name: 'Avatar',
    group: 'Surfaces',
    render: () => (
      <Row>
        <Avatar name="Kevin Dolié" size="sm" />
        <Avatar name="Kevin Dolié" size="md" />
        <Avatar name="Kevin Dolié" size="lg" />
        <Avatar name="Léa" />
      </Row>
    ),
  },
  {
    id: 'iconbutton',
    name: 'IconButton',
    group: 'Surfaces',
    render: () => (
      <Row>
        <IconButton aria-label="Rechercher" icon={<span>🔍</span>} />
        <IconButton aria-label="Paramètres" variant="secondary" icon={<span>⚙️</span>} />
        <IconButton aria-label="Ajouter" variant="primary" icon={<span>＋</span>} />
        <IconButton aria-label="Supprimer" variant="danger" icon={<span>🗑️</span>} />
      </Row>
    ),
  },
  {
    id: 'divider',
    name: 'Divider',
    group: 'Surfaces',
    render: () => (
      <Stack>
        <div>Au-dessus</div>
        <Divider />
        <Divider label="ou" />
        <div className="flex h-10 items-center gap-3">
          <span>Gauche</span>
          <Divider orientation="vertical" />
          <span>Droite</span>
        </div>
      </Stack>
    ),
  },
  {
    id: 'scrollarea',
    name: 'ScrollArea',
    group: 'Surfaces',
    render: () => (
      <ScrollArea maxHeight={160} className="max-w-sm rounded-lg border border-border p-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="py-1.5 text-sm text-text-secondary">
            Élément {i + 1}
          </div>
        ))}
      </ScrollArea>
    ),
  },

  {
    id: 'insightcard',
    name: 'InsightCard',
    group: 'Home (vivant)',
    render: () => (
      <div className="grid max-w-lg gap-3 sm:grid-cols-2">
        <InsightCard
          icon="📷"
          label="Photos"
          value="148 nouvelles"
          meta="ajoutées aujourd’hui"
          accent="vision"
          onActivate={() => {}}
        />
        <InsightCard
          icon="🎬"
          label="À reprendre"
          value="The Last of Us"
          meta="23 min restantes"
          accent="media"
          onActivate={() => {}}
        />
        <InsightCard icon="🖥️" label="Serveur" value="Actif depuis 17 jours" accent="monitor" />
        <InsightCard
          icon="⚠️"
          label="Stockage"
          value="Disque bientôt plein"
          meta="92 % — priorité haute"
          accent="drive"
          emphasis
          onActivate={() => {}}
        />
      </div>
    ),
  },
  {
    id: 'typingtext',
    name: 'TypingText',
    group: 'Home (vivant)',
    render: () => <TypingDemo />,
  },

  {
    id: 'mediaplayer',
    name: 'MediaPlayer',
    group: 'KOS Media',
    render: () => (
      <div className="max-w-3xl overflow-hidden rounded-xl bg-[rgba(0,0,0,0.9)]">
        <MediaPlayer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          title="Big Buck Bunny"
          startAt={12}
          subtitles={[
            {
              id: 'fr',
              lang: 'fr',
              label: 'Français',
              url: 'data:text/vtt,WEBVTT%0A%0A00:00.000%20--%3E%2000:05.000%0ASous-titres%20KevinOS',
            },
          ]}
          className="w-full"
        />
      </div>
    ),
  },

  {
    id: 'documentpreview',
    name: 'DocumentPreview',
    group: 'KOS Drive',
    render: () => (
      <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
        <DocumentPreview
          name="notes-kevinos.md"
          kind="markdown"
          mode="text"
          text={
            '# Notes KevinOS\n\nKevinOS doit devenir mon système d’exploitation personnel.\nChaque compétence doit être réellement utilisable au quotidien.'
          }
          onDownload={() => {}}
          className="h-72"
        />
        <DocumentPreview
          name="budget-2026.xlsx"
          kind="excel"
          mode="download"
          onDownload={() => {}}
          className="h-72"
        />
      </div>
    ),
  },
];
