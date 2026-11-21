import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/lib/i18n-client';
import type { Lang } from '@/lib/locale';
import en from '@/translations/en.json';
import ua from '@/translations/ua.json';
import Button, { buttonClass } from './Button';

const loop = vi.hoisted(() => ({ unregister: vi.fn(), register: vi.fn() }));

vi.mock('./wineButtons/loop', () => ({ wineButtons: { register: loop.register } }));
loop.register.mockImplementation(() => loop.unregister);

/** Route links read the page language, as on the site. */
const InLang = ({ lang = 'en', children }: { lang?: Lang; children: ReactNode }) => (
  <I18nProvider lang={lang} dict={lang === 'uk' ? ua : en}>{children}</I18nProvider>
);

/** The shader layer inside a button, if any. */
const layer = (el: HTMLElement) => el.querySelector('canvas');

describe('Button', () => {
  it('renders a native button with the wine-flow fill by default', () => {
    render(<Button type="submit">Send</Button>);
    const button = screen.getByRole('button', { name: 'Send' });

    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('bg-wine-flow');
    expect(button.className).not.toMatch(/translate/);
  });

  it('has a compact small size', () => {
    render(<Button size="sm">Send</Button>);
    expect(screen.getByRole('button', { name: 'Send' })).toHaveClass('text-[15px]');
  });

  it('renders an anchor when given href', () => {
    render(<Button href="/cv.pdf" download>Download</Button>);
    const link = screen.getByRole('link', { name: 'Download' });

    expect(link).toHaveAttribute('href', '/cv.pdf');
    expect(link).toHaveAttribute('download');
    expect(link).toHaveClass('bg-wine-flow');
  });

  it('renders a locale route link when given to', () => {
    render(
      <InLang>
        <Button to="/cv" variant="outline">View CV</Button>
      </InLang>,
    );
    const link = screen.getByRole('link', { name: 'View CV' });

    expect(link).toHaveAttribute('href', '/cv');
    expect(link).not.toHaveClass('bg-wine-flow');
    expect(link.className).toMatch(/border/);
  });

  it('renders a hash link for in-page targets', () => {
    render(
      <InLang>
        <Button to="/#experience">Experience</Button>
      </InLang>,
    );
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '/#experience');
  });

  it('prefixes route and in-page links with the locale in Ukrainian', () => {
    render(
      <InLang lang="uk">
        <Button to="/cv/react-native" variant="edge">CV</Button>
        <Button to="/#experience">Experience</Button>
      </InLang>,
    );
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/uk/cv/react-native');
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '/uk#experience');
  });

  it('smooth-scrolls to an in-page target that is already on the page', () => {
    const scrollIntoView = vi.fn();

    render(
      <InLang>
        <section id="experience" />
        <Button to="/#experience">Experience</Button>
      </InLang>,
    );
    document.getElementById('experience')!.scrollIntoView = scrollIntoView;
    screen.getByRole('link', { name: 'Experience' }).click();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('uses a readable label size and a visible focus ring', () => {
    expect(buttonClass()).toMatch(/text-\[16px\]/);
    expect(buttonClass({ size: 'lg' })).toMatch(/text-\[17px\]/);
    expect(buttonClass()).toMatch(/focus-visible:/);
  });

  it('gives primary buttons a hidden canvas layer for the shared Wine shader, over the CSS fill', () => {
    loop.register.mockClear();
    render(<Button type="submit">Send</Button>);
    const button = screen.getByRole('button', { name: 'Send' });
    const canvas = layer(button);

    expect(button).toHaveClass('bg-wine-flow');
    expect(button).toHaveTextContent(/^Send$/);
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveClass('absolute', 'inset-0', 'pointer-events-none', '-z-[1]', 'opacity-0');
    expect(loop.register).toHaveBeenCalledWith(canvas);
  });

  it('adds the layer to primary links too, and never to outline buttons', () => {
    render(
      <InLang>
        <Button href="/cv.pdf" download>Download</Button>
        <Button to="/#experience">Experience</Button>
        <Button to="/cv" variant="outline">View CV</Button>
      </InLang>,
    );
    expect(layer(screen.getByRole('link', { name: 'Download' }))).not.toBeNull();
    expect(layer(screen.getByRole('link', { name: 'Experience' }))).not.toBeNull();
    expect(layer(screen.getByRole('link', { name: 'View CV' }))).toBeNull();
  });

  it('has an edge variant: a dark pill inside the animated wine frame, without the shader layer', () => {
    loop.register.mockClear();
    render(
      <InLang>
        <Button to="/cv" variant="edge" size="lg">View CV</Button>
      </InLang>,
    );
    const link = screen.getByRole('link', { name: 'View CV' });

    expect(link).toHaveClass('wine-edge', 'rounded-full', 'before:bg-surface', 'before:inset-px');
    expect(link).toHaveClass('text-[17px]', 'focus-visible:outline');
    expect(link.className).toMatch(/hover:brightness-/);
    expect(link).not.toHaveClass('bg-wine-flow');
    expect(layer(link)).toBeNull();
    expect(loop.register).not.toHaveBeenCalled();
  });

  it('unregisters its layer on unmount', () => {
    loop.unregister.mockClear();
    const { unmount } = render(<Button>Send</Button>);

    expect(loop.unregister).not.toHaveBeenCalled();
    unmount();
    expect(loop.unregister).toHaveBeenCalledTimes(1);
  });
});
