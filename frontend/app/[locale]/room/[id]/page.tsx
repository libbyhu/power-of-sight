import { EntryDetail } from './EntryDetail';

export default function EntryPage({ params }: { params: { id: string } }) {
  return <EntryDetail id={params.id} />;
}
