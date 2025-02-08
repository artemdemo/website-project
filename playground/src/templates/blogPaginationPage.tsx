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
          <img src={page.route! + '/' + page.thumbnail} />
          <p dangerouslySetInnerHTML={{ __html: page.excerpt || '' }}></p>
        </div>
      ))}
      <div>
        {Array.from({ length: pagination.totalPages }).map((_, idx) => (
          <span key={idx}>{idx + 1}</span>
        ))}
      </div>
    </div>
  );
};

export default blogPaginationPage;
