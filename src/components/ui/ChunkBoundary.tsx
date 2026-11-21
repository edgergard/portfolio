import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback: ReactNode };

/**
 * Catches a lazy chunk that fails to load (its hashed file is gone after a redeploy while the
 * page was open) and shows `fallback` in its place, so the rest of the page stays up.
 */
class ChunkBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default ChunkBoundary;
