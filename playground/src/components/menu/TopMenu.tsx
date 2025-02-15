import React from 'react';
import { MenuLink } from './MenuLink';

export const TopMenu: React.FC = () => {
  return (
    <div>
      <h4>Top Menu</h4>
      <div>
        <MenuLink>
          <a href="/">Home</a>
        </MenuLink>
        <MenuLink>
          <a href="/blog/">Blog</a>
        </MenuLink>
        <MenuLink>
          <a href="/blog/recent/">Recent Posts</a>
        </MenuLink>
        <MenuLink>
          <a href="/about/">About</a>
        </MenuLink>
        <MenuLink>
          <a href="/contact/">Contact</a>
        </MenuLink>
      </div>
    </div>
  );
};
