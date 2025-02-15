import React from 'react';
import './PageTags.css';

export const PageTags: React.FC<{ tags?: string[] }> = ({ tags = [] }) => {
  return (
    <div>
      {tags.map((tag) => (
        <a className="page-tag" href={`/blog/tag/${tag}/`} key={tag}>
          {tag}&nbsp;
        </a>
      ))}
    </div>
  );
};
