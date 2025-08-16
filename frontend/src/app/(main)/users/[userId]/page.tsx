'use client';

import { useParams } from 'next/navigation';

const UserPage = () => {
  const { userId } = useParams();

  return <div>userId: {userId}</div>;
};

export default UserPage;
