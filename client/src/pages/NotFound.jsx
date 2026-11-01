import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState title="Page not found" text="The page you are looking for does not exist or was moved." actionLabel="Go to home" actionTo="/" />
    </div>
  );
}
