import React from 'react';
import { QueryPagesFn } from 'site-builder/types';
import { MenuLink } from './MenuLink';
import './TopMenu.css';

export const TopMenu: React.FC<{ queryPages: QueryPagesFn }> = ({
  queryPages,
}) => {
  return (
    <div>
      <h2>Menu</h2>
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
