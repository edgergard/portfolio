import NotFoundView from '@/components/layout/NotFoundView';
import Button from '@/components/ui/Button';
import { T } from '@/lib/i18n-client';

/**
 * 404 for an explicit notFound() inside the [lang] layout (header, footer, theme); the home link
 * follows the page language. Unmatched URLs get global-not-found instead.
 */
export default function NotFound() {
  return (
    <NotFoundView
      label={<T k="not_found_label" />}
      title={<T k="not_found_title" />}
      text={<T k="not_found_text" />}
      action={(
        <Button to="/" variant="outline">
          <T k="not_found_home" />
        </Button>
      )}
    />
  );
}
