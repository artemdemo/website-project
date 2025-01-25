import React, { useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it } from 'vitest';

const TestApp = () => {
  useEffect(() => {
    console.log(111);
  }, []);
  console.log(222);
  return <h1>Header</h1>;
};

describe('Index', () => {
  it('Rendering to string', () => {
    console.log(
      // renderToString(<TestApp />)
      renderToString(React.createElement(TestApp)),
    );
    console.log(renderToString(<TestApp />));
  });
});
