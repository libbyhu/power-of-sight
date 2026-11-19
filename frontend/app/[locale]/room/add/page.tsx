import { Suspense } from 'react';
import { AddEntry } from './AddEntry';

export default function AddEntryPage() {
  return (
    <Suspense>
      <AddEntry />
    </Suspense>
  );
}
