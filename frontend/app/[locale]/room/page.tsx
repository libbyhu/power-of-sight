import { Suspense } from 'react';
import { RoomView } from './RoomView';

export default function RoomPage() {
  return (
    <Suspense>
      <RoomView />
    </Suspense>
  );
}
