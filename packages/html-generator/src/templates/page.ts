const pageTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title><%= pageTitle %></title>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="<%= metaDescription %>">
  <script type="module">
    // "UMD builds removed"
    // https://react.dev/blog/2024/04/25/react-19-upgrade-guide#umd-builds-removed
    // import React from "https://esm.sh/react@19/?dev";
    // import ReactDOMClient from "https://esm.sh/react-dom@19/client?dev";
  </script>
  <% for (const asset of assets) { %>
    <% if (asset.type == 'css') { %>
      <link rel="stylesheet" href="<%- asset.linkHref %>">
    <% } %>
  <% } %>
</head>
<body>
  <div id="root">
    <%- content %>
  </div>
</body>
</html>
`;

export default pageTemplate;
