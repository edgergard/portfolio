import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { CERTIFICATES } from '../../data/content';
import Reveal from '../layout/Reveal';
import Section from '../layout/Section';

const Certifications = () => {
  const { t } = useTranslation();

  return (
    <Section id="certifications" index={4} labelKey="section_certifications">
      <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-2">
        {CERTIFICATES.map(cert => (
          <Reveal key={cert.id} testId="cert-card" className="wine-edge flex">
            <div className="grid flex-1 gap-7 rounded-[19px] bg-[linear-gradient(160deg,#121214_0%,#0A0A0B_60%)] p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-mono text-xs font-normal uppercase tracking-[.08em] text-muted">
                  {cert.issuer} · {t('cert_title')}
                </h3>
                <div className="text-right leading-[normal]">
                  <div className="font-mono text-xs uppercase tracking-[.08em] text-muted">{t('cert_score')}</div>
                  <b className="text-[34px] font-medium tracking-[-0.03em]">
                    {cert.score}
                    <span className="text-lg text-muted">/{cert.max}</span>
                  </b>
                </div>
              </div>
              <div className="text-[64px] font-medium leading-[.85] tracking-[-0.05em] min-[900px]:text-[88px]">
                {cert.level}
                <small className="mt-3.5 block text-[15px] font-normal tracking-normal text-muted-2">
                  {t(cert.levelNameKey)}
                </small>
              </div>
              <div className="grid gap-3.5">
                {cert.parts.map(part => (
                  <div
                    key={part.labelKey}
                    className="grid grid-cols-[90px_1fr_36px] items-center gap-3.5 text-sm leading-[normal] text-ink-2"
                  >
                    <span>{t(part.labelKey)}</span>
                    <i
                      data-testid="cert-bar"
                      style={{ '--w': `${(part.value / cert.max) * 100}%` } as CSSProperties}
                      className="relative h-1 overflow-hidden rounded bg-line after:absolute after:inset-0 after:w-[var(--w)] after:rounded after:bg-wine-2 after:content-['']"
                    />
                    <em className="text-right font-mono text-xs not-italic text-ink">{part.value}</em>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-5">
                <span className="font-mono text-xs uppercase tracking-[.08em] text-muted">{t(cert.awardedKey)}</span>
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noreferrer"
                  className="whitespace-nowrap border-b border-wine pb-[3px] text-sm font-medium"
                >
                  {t('cert_view')} <span aria-hidden>↗</span>
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default Certifications;
