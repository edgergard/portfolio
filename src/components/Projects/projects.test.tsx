import { act, cleanup, render, screen, within } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import i18n from '../../i18n';
import en from '../../translations/en.json';
import ua from '../../translations/ua.json';
import { featuredProjects, PROJECT_LIST } from '../../data/projects';
import css from '../../../styles.css?raw';
import type { Project } from '../../types/Project';
import Projects from './Projects';
import ProjectRow from './ProjectRow';
import ProjectMedia from './ProjectMedia';

// jsdom never reports intersections, so render the reveal wrapper as a plain div.
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

// The live shader is covered by its own tests; keep three.js out of these.
vi.mock('../Wine/WineSurface', () => ({
  default: () => <div data-testid="wine-surface" />,
}));

const stubReducedMotion = (reduce: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: reduce && query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );

/** An IntersectionObserver whose callbacks the test fires by hand. */
const observers: { cb: IntersectionObserverCallback; options?: IntersectionObserverInit }[] = [];

class ControlledObserver {
  constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    observers.push({ cb, options });
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const intersect = (ratio: number) =>
  act(() => {
    for (const { cb } of observers) {
      cb(
        [{ isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    }
  });

const base = PROJECT_LIST[0];

const withVideo: Project = {
  ...base,
  id: 101,
  name: 'Video project',
  video: { webm: '/v/demo.webm', mp4: '/v/demo.mp4' },
};

const mobileApp: Project = {
  ...base,
  id: 102,
  name: 'Mobile app',
  type: 'mobile',
  demolink: undefined,
  codelink: undefined,
  appStore: 'https://apps.apple.com/app/id1',
  googlePlay: undefined,
};

let play: ReturnType<typeof vi.fn>;
let pause: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observers.length = 0;
  stubReducedMotion(false);
  vi.stubGlobal('IntersectionObserver', ControlledObserver);
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
});

afterEach(async () => {
  cleanup(); // unmount (pausing videos) while play/pause are still stubbed
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  await i18n.changeLanguage('en');
});

const renderSection = () =>
  render(
    <HashRouter>
      <Projects />
    </HashRouter>,
  );

describe('Projects section', () => {
  it('renders exactly the 3 featured projects in order', () => {
    renderSection();
    const rows = screen.getAllByTestId('project-row');

    expect(rows).toHaveLength(3);
    expect(featuredProjects().map(p => p.name)).toEqual(['Pokemon Trainer', 'Vue Weather App', 'Rick and Morty API app']);
    expect(rows.map(r => within(r).getByRole('heading', { level: 3 }).textContent)).toEqual(
      featuredProjects().map(p => p.name),
    );
  });

  it('sits on the live wine band', () => {
    renderSection();
    const band = screen.getByTestId('projects-band');

    expect(band).toHaveClass('bg-wine-flow');
    // .bg-wine-flow brightens on hover (written for buttons); a section-sized band must not flash.
    expect(band).toHaveClass('hover:filter-none');
    expect(within(band).getByTestId('wine-surface')).toBeInTheDocument();
  });

  it('shows stack badges on the live wine fill, like the Experience badges', () => {
    renderSection();
    const badges = screen.getAllByTestId('project-badge');

    expect(badges.length).toBeGreaterThan(3);
    badges.forEach(b => {
      expect(b).toHaveClass('bg-wine-flow');
      expect(b.querySelector('canvas')).not.toBeNull();
    });
  });

  it('alternates the media side', () => {
    renderSection();
    const rows = screen.getAllByTestId('project-row');

    expect(rows.map(r => r.getAttribute('data-reverse'))).toEqual(['false', 'true', 'false']);
  });

  it('shows the number, type and year line', () => {
    renderSection();
    const [first] = screen.getAllByTestId('project-row');

    expect(within(first).getByText('01 — Web · 2024')).toBeInTheDocument();
  });

  it('renders Live and Code links from the data', () => {
    renderSection();
    const rows = screen.getAllByTestId('project-row');

    rows.forEach((row, i) => {
      const p = featuredProjects()[i];

      expect(within(row).getByRole('link', { name: `Live demo — ${p.name}` })).toHaveAttribute('href', p.demolink);
      expect(within(row).getByRole('link', { name: `Code — ${p.name}` })).toHaveAttribute('href', p.codelink);
      expect(within(row).queryByRole('link', { name: /App Store/ })).toBeNull();
      expect(within(row).queryByRole('link', { name: /Google Play/ })).toBeNull();
    });
  });

  it('plays a recorded demo loop in every featured row', () => {
    renderSection();
    const rows = screen.getAllByTestId('project-row');
    const sourcesOf = (row: HTMLElement) => [...row.querySelectorAll('video source')].map(s => s.getAttribute('src'));
    const base = import.meta.env.BASE_URL;

    expect(sourcesOf(rows[0])).toEqual([`${base}videos/pokemon.webm`, `${base}videos/pokemon.mp4`]);
    expect(sourcesOf(rows[1])).toEqual([`${base}videos/weather.webm`, `${base}videos/weather.mp4`]);
    expect(sourcesOf(rows[2])).toEqual([`${base}videos/rick-and-morty.webm`, `${base}videos/rick-and-morty.mp4`]);
    expect(rows[1].querySelector('video')).toHaveAttribute('poster', `${base}videos/weather.jpg`);
  });

  it('gives the media the same column width in every row, whichever side it sits on', () => {
    renderSection();
    const rows = screen.getAllByTestId('project-row');

    // The media column is the wide one (1.35fr) on both sides, so the frames match in size.
    expect(rows[0].className).toContain('min-[900px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]');
    expect(rows[1].className).toContain('min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]');
  });

  it('keeps the browser frame bar light in the light theme (dark stays as it was)', () => {
    renderSection();
    const bar = screen.getAllByTestId('frame-bar')[0];

    // Dark look stays on the element itself.
    expect(bar).toHaveClass('frame-bar', 'bg-[#161618]', 'border-[#232327]');
    // Light theme: a light bar, and no unscoped rule touches the dark frame.
    expect(css).toMatch(/:root\[data-theme='light'\] \.frame-bar \{[^}]*background-color: #F4F1EF/);
    expect(css).not.toMatch(/^\.frame(-bar|-dot|-host)?\b[^{]*\{/m);
  });

  it('links to the archive with the total count', () => {
    renderSection();
    const link = screen.getByRole('link', { name: `All projects · Archive (${PROJECT_LIST.length})` });

    expect(link).toHaveAttribute('href', '#/projects');
  });

  it('shows the archive as a glass card: year range, "See all N projects", previews, arrow', () => {
    renderSection();
    const cta = screen.getByTestId('archive-cta');

    expect(cta).toHaveTextContent('Archive · 2023 — 2024');
    expect(cta).toHaveTextContent(`See all ${PROJECT_LIST.length} projects`);
    expect(cta.querySelectorAll('img')).toHaveLength(3);
    expect(cta).toHaveClass('backdrop-blur-[14px]');
  });

  it('translates the archive link and type to Ukrainian', async () => {
    await i18n.changeLanguage('ua');
    renderSection();

    expect(screen.getByRole('link', { name: `Усі проєкти · Архів (${PROJECT_LIST.length})` })).toBeInTheDocument();
    expect(screen.getByText('01 — Веб · 2024')).toBeInTheDocument();
  });
});

describe('ProjectRow', () => {
  it('renders only the store links a project has', () => {
    render(<ProjectRow project={mobileApp} index={0} reverse={false} />);
    const row = screen.getByTestId('project-row');

    expect(within(row).getByRole('link', { name: 'App Store — Mobile app' })).toHaveAttribute('href', mobileApp.appStore);
    expect(within(row).queryByRole('link', { name: /Google Play/ })).toBeNull();
    expect(within(row).queryByRole('link', { name: /Live demo/ })).toBeNull();
    expect(within(row).queryByRole('link', { name: /Code/ })).toBeNull();
    expect(within(row).getByText('01 — Mobile · 2023')).toBeInTheDocument();
  });

  it('keeps every link when two share a URL, without duplicate-key warnings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const shared = { ...base, demolink: 'https://example.com/app', appStore: 'https://example.com/app' };

    render(<ProjectRow project={shared} index={0} reverse={false} />);

    expect(screen.getByRole('link', { name: `Live demo — ${base.name}` })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: `App Store — ${base.name}` })).toBeInTheDocument();
    expect(error.mock.calls.flat().join(' ')).not.toMatch(/same key/);
    error.mockRestore();
  });
});

describe('ProjectMedia', () => {
  it('shows the poster image and no video when the project has none', () => {
    const { container } = render(<ProjectMedia project={base} />);

    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute('src', base.poster);
  });

  it('pans the poster slowly, but not under reduced motion', () => {
    const { container, unmount } = render(<ProjectMedia project={base} />);

    expect(container.querySelector('img')).toHaveClass('poster-pan');
    unmount();

    stubReducedMotion(true);
    const reduced = render(<ProjectMedia project={base} />);

    expect(reduced.container.querySelector('img')).not.toHaveClass('poster-pan');
  });

  it('frames web projects in a browser and mobile projects in a phone', () => {
    const { unmount } = render(<ProjectMedia project={base} />);

    expect(screen.getByTestId('project-media')).toHaveAttribute('data-frame', 'browser');
    expect(screen.getByText('fe-jul23-codedynasty.github.io')).toBeInTheDocument();
    unmount();

    render(<ProjectMedia project={mobileApp} />);
    expect(screen.getByTestId('project-media')).toHaveAttribute('data-frame', 'phone');
  });

  it('renders a muted inline looping video that preloads nothing, with webm and mp4 sources', () => {
    const { container } = render(<ProjectMedia project={withVideo} />);
    const video = container.querySelector('video')!;

    expect(video).not.toBeNull();
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute('poster', withVideo.poster);
    expect(video).not.toHaveAttribute('autoplay');
    expect([...video.querySelectorAll('source')].map(s => [s.getAttribute('src'), s.getAttribute('type')])).toEqual([
      ['/v/demo.webm', 'video/webm'],
      ['/v/demo.mp4', 'video/mp4'],
    ]);
  });

  it('plays while at least a quarter is in view and pauses otherwise', () => {
    render(<ProjectMedia project={withVideo} />);

    expect(observers).toHaveLength(1);
    expect(observers[0].options?.threshold).toBe(0.25);

    intersect(0.5);
    expect(play).toHaveBeenCalledTimes(1);

    intersect(0);
    expect(pause).toHaveBeenCalled();
  });

  it('never plays under reduced motion, even when in view', () => {
    stubReducedMotion(true);
    const { container } = render(<ProjectMedia project={withVideo} />);

    intersect(1);

    expect(play).not.toHaveBeenCalled();
    expect(observers).toHaveLength(0);
    expect(container.querySelector('video')).not.toHaveAttribute('autoplay');
  });

  it('pauses and stops observing when reduced motion turns on while playing', () => {
    const listeners: (() => void)[] = [];
    let reduce = false;

    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          get matches() {
            return reduce && query === '(prefers-reduced-motion: reduce)';
          },
          media: query,
          addEventListener: (_: string, cb: () => void) => listeners.push(cb),
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    render(<ProjectMedia project={withVideo} />);

    intersect(1);
    expect(play).toHaveBeenCalledTimes(1);
    pause.mockClear();

    reduce = true;
    act(() => listeners.forEach(cb => cb()));
    expect(pause).toHaveBeenCalled();

    expect(observers).toHaveLength(1); // the effect re-ran without observing again
  });
});

describe('translations', () => {
  it('has every new key in EN and UA', () => {
    for (const key of ['projects_archive_link', 'projects_archive_kicker', 'projects_archive_title', 'project_type_web', 'project_type_mobile', 'btn_app_store', 'btn_google_play']) {
      expect(en).toHaveProperty(key);
      expect(ua).toHaveProperty(key);
    }
  });
});
