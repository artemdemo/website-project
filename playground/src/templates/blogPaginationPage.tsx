import React from 'react';

export const blogPaginationPage: React.FC<{
  posts: {
    route: string;
    excerpt: string;
    thumbnail: string;
    config: { title: string };
  }[];
  pagination: {
    currentPageIdx: number;
    totalPages: number;
  };
}> = ({ posts, pagination }) => {
  return (
    <div>
      {posts.map((post) => (
        <div key={post.route}>
          <h3>
            <a href={post.route}>{post.config?.title}</a>
          </h3>
          <img src={post.route! + '/' + post.thumbnail} />
          <p dangerouslySetInnerHTML={{ __html: post.excerpt || '' }}></p>
        </div>
      ))}
      <div>
        {Array.from({ length: pagination.totalPages }).map((_, idx) => (
          <span>{idx + 1}</span>
        ))}
      </div>
    </div>
  );
};
