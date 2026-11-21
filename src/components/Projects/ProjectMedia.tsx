'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { Project } from '../../types/Project';
import { usePrefersReducedMotion } from '../Hero/sceneSupport';
import { useInViewVideo } from './useInViewVideo';

type Props = { project: Project };

/** The media column is at most ~560px wide from 900px up, and full width below. */
export const POSTER_SIZES = '(min-width: 900px) 560px, 100vw';

const hostOf = (url?: string) => {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
};

/**
 * The project's loop: a muted inline video that plays only while in view (never under reduced
 * motion), or the poster with a slow pan when there is no video yet.
 */
const Screen = ({ project }: Props) => {
  const reducedMotion = usePrefersReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const { poster, video: sources } = project;

  useInViewVideo(video, Boolean(sources) && !reducedMotion);

  if (sources) {
    return (
      <>
        {/* The poster frame as a lazy, resized image under the video (not the video's poster
            attribute, which the browser fetches at full size during page load). The video is
            transparent until it plays, then covers it. */}
        <Image src={poster} alt="" fill sizes={POSTER_SIZES} loading="lazy" className="block h-full w-full object-cover" />
        <video
          ref={video}
          muted
          // React compares the muted property during hydration and always reports a mismatch for
          // prerendered <video muted>; useInViewVideo sets the property, so the warning is noise.
          suppressHydrationWarning
          loop
          playsInline
          preload="none"
          aria-hidden
          className="relative block h-full w-full object-cover"
        >
          {sources.webm && <source src={sources.webm} type="video/webm" />}
          {sources.mp4 && <source src={sources.mp4} type="video/mp4" />}
        </video>
      </>
    );
  }

  // `fill` sizes the image to its frame (the parent is positioned and sized by aspect ratio).
  return (
    <Image
      src={poster}
      alt=""
      fill
      sizes={POSTER_SIZES}
      loading="lazy"
      className={`block h-full w-full object-cover ${reducedMotion ? '' : 'poster-pan'}`}
    />
  );
};

/** Phone frame (9:19.5) for mobile projects, browser frame (bar + 16:10) for web ones. */
const ProjectMedia = ({ project }: Props) => {
  if (project.type === 'mobile') {
    return (
      <div
        data-testid="project-media"
        data-frame="phone"
        className="flex justify-center rounded-3xl border border-white/[.12] bg-white/[.04] p-6 backdrop-blur-[6px] min-[900px]:p-8"
      >
        <div className="relative aspect-[9/19.5] w-[220px] rounded-[36px] border border-chip bg-[#121214] p-2.5 min-[900px]:w-[260px]">
          <i aria-hidden className="absolute left-1/2 top-[18px] z-[2] h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" />
          <div className="relative h-full overflow-hidden rounded-[28px] bg-[#111]">
            <Screen project={project} />
          </div>
        </div>
      </div>
    );
  }

  const host = hostOf(project.demolink);

  return (
    <div
      data-testid="project-media"
      data-frame="browser"
      className="frame overflow-hidden rounded-[14px] border border-line bg-[#111]"
    >
      {/* Dark bar in the dark theme; styles.css (.frame-bar) gives it a light browser look in light. */}
      <div
        aria-hidden
        data-testid="frame-bar"
        className="frame-bar flex h-[30px] items-center gap-1.5 border-b border-[#232327] bg-[#161618] px-3"
      >
        <s className="frame-dot block h-[9px] w-[9px] rounded-full bg-[#2E2E33]" />
        <s className="frame-dot block h-[9px] w-[9px] rounded-full bg-[#2E2E33]" />
        <s className="frame-dot block h-[9px] w-[9px] rounded-full bg-[#2E2E33]" />
        {host && <span className="frame-host ml-3 truncate font-mono text-[11px] text-muted">{host}</span>}
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Screen project={project} />
      </div>
    </div>
  );
};

export default ProjectMedia;
