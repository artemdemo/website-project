import React from 'react';
import { QueryPagesFn } from 'site-builder/types';
import { MenuLink } from './MenuLink';
import './QueryPagesMenu.css';

export const QueryPagesMenu: React.FC<{ queryPages: QueryPagesFn }> = ({
  queryPages,
}) => {
  return (
    <div className="QueryPagesMenu">
      <h2>Query Pages Menu</h2>
      <div>
        {queryPages().map((page) => (
          <MenuLink key={page.path}>
            <a href={page.route}>
              "{page.config.title}" - {page.relativePath}
            </a>
          </MenuLink>
        ))}
      </div>
    </div>
  );
};
