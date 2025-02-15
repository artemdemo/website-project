import React from 'react';

const tagPage: React.FC<{
  pages: {
    route: string;
    excerpt: string;
    thumbnail: string;
    config: { title: string };
  }[];
  // ToDo: I will need to introduce here a pagination
  //   Same as in `blogPaginationPage()`
}> = ({ pages }) => {
  return (
    <div>
      {/* ToDo: This is same loop as in `blogPaginationPage()`,
            consider code sharing */}
      {pages.map((page) => (
        <div key={page.route}>
          <h3>
            <a href={page.route + '/'}>{page.config?.title}</a>
          </h3>
          {page.thumbnail && <img src={page.route! + '/' + page.thumbnail} />}
          {page.excerpt && (
            <p dangerouslySetInnerHTML={{ __html: page.excerpt || '' }}></p>
          )}
        </div>
      ))}
    </div>
  );
};

export default tagPage;
