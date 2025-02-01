import React from 'react';
import { PageComponent } from 'site-builder/types';
import { TopMenu } from '../../components/menu/TopMenu';
import './about.css';

const About: PageComponent = ({ queryPages }) => {
  return (
    <>
      <TopMenu queryPages={queryPages} />
      <h1 className="Title">About Page</h1>
    </>
  );
};

export default About;
