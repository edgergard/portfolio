import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { CVS } from '../../data/cv';
import CvPage from '../CvPage';

const Probe = () => <span data-testid="loc">{useLocation().search}</span>;

const renderAt = (search = '') =>
  render(
    <MemoryRouter initialEntries={[`/cv${search}`]}>
      <CvPage />
      <Probe />
    </MemoryRouter>,
  );

const mockNarrow = (matches: boolean) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: matches && query === '(max-width: 899px)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );

const scrollTo = vi.fn();
beforeEach(() => {
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  scrollTo.mockClear();
});
afterEach(() => vi.restoreAllMocks());

describe('CvPage', () => {
  it('defaults to React Native and the Web view', () => {
    renderAt();
    expect(screen.getByRole('button', { name: 'React Native' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Frontend' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Web' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(CVS['react-native'].title)).toBeInTheDocument();
  });

  it('reads ?v=frontend&view=pdf', () => {
    renderAt('?v=frontend&view=pdf');
    expect(screen.getByRole('button', { name: 'Frontend' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'PDF' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('falls back to defaults for invalid params', () => {
    renderAt('?v=bogus&view=x');
    expect(screen.getByRole('button', { name: 'React Native' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Web' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('clicking Frontend writes v=frontend to the URL', () => {
    renderAt();
    fireEvent.click(screen.getByRole('button', { name: 'Frontend' }));
    expect(screen.getByTestId('loc').textContent).toContain('v=frontend');
    expect(screen.getByText(CVS.frontend.title)).toBeInTheDocument();
  });

  it('Download PDF links to the selected PDF with the download attribute', () => {
    renderAt('?v=frontend');
    const link = screen.getByRole('link', { name: /Download PDF/ });
    expect(link.getAttribute('href')).toMatch(/oleksandr-bryksin-frontend-cv\.pdf$/);
    expect(link).toHaveAttribute('download');
  });

  it('PDF view renders an <object type="application/pdf"> on desktop', () => {
    mockNarrow(false);
    const { container } = renderAt('?view=pdf');
    const obj = container.querySelector('object[type="application/pdf"]');
    expect(obj).not.toBeNull();
    expect(obj?.getAttribute('data')).toMatch(/oleksandr-bryksin-react-native-cv\.pdf/);
  });

  it('PDF view on mobile shows Open PDF and Download links, no <object>', () => {
    mockNarrow(true);
    const { container } = renderAt('?view=pdf');
    expect(container.querySelector('object')).toBeNull();
    expect(screen.getByRole('link', { name: 'Open PDF' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('download');
  });

  it('scrolls to top on mount', () => {
    renderAt();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('does not show a phone number', () => {
    renderAt();
    expect(document.body.textContent).not.toMatch(/\+380|tel:/);
  });
});

describe('CVS data', () => {
  for (const doc of Object.values(CVS)) {
    it(`${doc.variant} has summary and experience`, () => {
      expect(doc.summary.length).toBeGreaterThan(0);
      expect(doc.experience.length).toBeGreaterThanOrEqual(1);
    });
  }
});
