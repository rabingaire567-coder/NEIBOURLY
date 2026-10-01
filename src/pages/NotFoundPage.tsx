import { Link } from 'react-router-dom';
import { Button, Empty } from '@/components/ui';
import { IconSearch } from '@/components/Icons';

export function NotFoundPage() {
  return (
    <div className="wrap wrap--narrow">
      <Empty
        icon={<IconSearch size={22} />}
        title="This page does not exist"
        children="The link may be old, or the address mistyped. The board is still where you left it."
        action={
          <div className="row row--wrap" style={{ justifyContent: 'center' }}>
            <Link to="/">
              <Button>Go to home</Button>
            </Link>
            <Link to="/discover">
              <Button variant="secondary">Browse Discover</Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}

export function ErrorPage() {
  return (
    <div className="wrap wrap--narrow">
      <Empty
        title="Something went wrong"
        children="This is a bug in NEIBOURLY, not something you did. Reload the page to continue."
        action={
          <Link to="/">
            <Button>Reload the app</Button>
          </Link>
        }
      />
    </div>
  );
}
