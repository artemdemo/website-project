import React from 'react';

const blogPaginationPage: React.FC<{
  pages: {
    route: string;
    excerpt: string;
    thumbnail: string;
    config: { title: string };
  }[];
  pagination: {
    currentPageIdx: number;
    totalPages: number;
  };
}> = ({ pages, pagination }) => {
  return (
    <div>
      {pages.map((page) => (
        <div key={page.route}>
          <h3>
            <a href={page.route}>{page.config?.title}</a>
          </h3>
          {page.thumbnail && (
            <img src={page.route! + '/' + page.thumbnail} />
          )}
          {page.excerpt && (
            <p dangerouslySetInnerHTML={{ __html: page.excerpt || '' }}></p>
          )}
        </div>
      ))}
      <div>
        {Array.from({ length: pagination.totalPages }).map((_, idx) => (
          <span key={idx}>
            <a href={`/blog/page/${idx + 1}`}>{idx + 1}&nbsp;</a>
          </span>
        ))}
      </div>
    </div>
  );
};

export default blogPaginationPage;
