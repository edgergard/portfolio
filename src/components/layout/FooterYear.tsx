'use client';

import { useClientValue } from '../../utils/clientValue';

const noSubscribe = () => () => {};

const thisYear = () => new Date().getFullYear();

/** The prerendered page carries the build year; the visit year takes over after hydration. */
const FooterYear = ({ buildYear }: { buildYear: number }) =>
  useClientValue(noSubscribe, thisYear, buildYear);

export default FooterYear;
