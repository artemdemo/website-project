import React from 'react';
import { QueryPagesFn } from 'site-builder/types';

export const TopMenu: React.FC<{ queryPages: QueryPagesFn }> = ({
  queryPages,
}) => {
  return (
    <div>
      <h2>Menu</h2>
      <div>
        {queryPages().map((page) => (
          <div key={page.path}>
            <a href={page.route}>
              "{page.config.title}" - {page.relativePath}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
