import React from 'react';
import { PageComponent } from 'site-builder/types';
import './about.css';

const About: PageComponent = ({ queryPages }) => {
  return (
    <>
      <h1 className="Title">About Page</h1>
      <img src="ab-bg.png" />
    </>
  );
};

export default About;
