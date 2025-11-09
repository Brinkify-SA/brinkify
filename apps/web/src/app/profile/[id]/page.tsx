import type { FC } from 'react';

interface PageProps {
  params: {
    id: string;
  };
}

const Page: FC<PageProps> = ({ params }) => {
  return (
    <div>
      <h1>Profile Page</h1>
      <p>User ID: {params.id}</p>
    </div>
  );
};

export default Page;
