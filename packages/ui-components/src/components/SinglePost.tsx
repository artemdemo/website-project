import React from 'react';

interface Props {
  children: React.ReactNode;
}

const SinglePost: React.FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};

export default SinglePost;
