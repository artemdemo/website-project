import React, { useEffect, useContext } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it } from 'vitest';
import { TestContext, TestProvider } from './TestProvider';

const TestApp = () => {
  // useEffect(() => {
  //   console.log(111);
  // }, []);
  // console.log(222);
  const testContext = useContext(TestContext);
  console.log(testContext);
  return <h1>Header, {testContext.someValue}</h1>;
};

describe('Index', () => {
  it('Rendering to string', () => {
    // console.log(
    //   renderToString(React.createElement(TestApp)),
    // );
    console.log(
      renderToString(
        <TestProvider>
          <TestApp />
        </TestProvider>,
      ),
    );
  });
});
