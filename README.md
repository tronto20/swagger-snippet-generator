# Swagger Snippet Generator
**Generates code snippets in Swagger UI.**

This package takes as input an HTTP Request. It translates the request into an [HTTP Archive 1.2 request object](http://www.softwareishard.com/blog/har-12-spec/#request). It uses the [HTTP Snippet](https://github.com/Mashape/httpsnippet) library to generate code snippets for every API endpoint (URL path + HTTP method) defined in the specification in various languages & tools (`cURL`, `Node`, `Python`, `Ruby`, `Java`, `Go`, `C#`...), or for selected endpoints.

This Repository is forked from [ErikWittern/openapi-snippet](https://github.com/ErikWittern/openapi-snippet)

## Features

- Generate request snippets from request data.
- Fix style of RequestSnippets in SwaggerUI.

## Installation

```bash
npm i swagger-snippet-generator
```

## Install as bundle (for use in browser)
Include the [swagger-snippet-generator.min.js](https://github.com/tronto20/swagger-snippet-generator/releases) file in your HTML page:

```html
<script charset="UTF-8" src="/path/to/swagger-snippet-generator.min.js" type="text/javascript"></script>
```

Use Swagger Snippet Generator, which now defines the global variable `SwaggerSnippetGenerator`:

```js
const snippetTargets = [
    {
        title: 'python (http.client)',
        target: 'python'
    },
    {
        target: 'python_requests'
    }
];

SwaggerUIBundle({
  ...
  plugins: [
    SwaggerSnippetGenerator(snippetTargets)
  ],
  requestSnippetsEnabled: true
  ...
});
```

## Build Swagger Snippet Generator
Clone this repository. Install required dependencies:

```bash
npm i
```

Build a minified version of Swagger Snippet Generator ([swagger-snippet-generator.min.js](dist%2Fswagger-snippet-generator.min.js)):

```bash
npm run build
```

## Sample with SwaggerUI

### With SwaggerUIBundle (unpkg)

Live Demo in [sample HTML](https://tronto20.github.io/swagger-snippet-generator/)

![img.png](docs/sample.png)

### With SwaggerUI module

```javascript
import SwaggerUI from 'swagger-ui';
import SwaggerSnippetGenerator from 'swagger-snippet-generator';

// define array of SnippetTarget
const snippetTargets = [
    {
        title: 'python (http.client)',
        target: 'python'
    },
    {
        target: 'python_requests'
    }
];

SwaggerUI({
  dom_id: '#swagger-ui',
  plugins: [
      SwaggerSnippetGenerator(snippetTargets)
  ],
  requestSnippetsEnabled: true
});
```

### SnippetTarget

Define target as SnippetTarget object
```javascript
SnippetTarget = {
  target: 'Target language and library (see below)',
  title:  '(Optional) Button title. Generate from target if undefined',
  syntax: '(Optional) Syntax highlighting. Detect from target if undefined.'
};
```


## Targets
Currently, Swagger Snippet Generator supports the following [targets](https://github.com/Kong/httpsnippet/tree/master/src/targets) (depending on the HTTP Snippet library):

* `c_libcurl` (default)
* `csharp_restsharp` (default)
* `csharp_httpclient`
* `go_native` (default)
* `java_okhttp`
* `java_unirest` (default)
* `javascript_jquery`
* `javascript_xhr` (default)
* `node_native` (default)
* `node_request`
* `node_unirest`
* `objc_nsurlsession` (default)
* `ocaml_cohttp` (default)
* `php_curl` (default)
* `php_http1`
* `php_http2`
* `python_python3` (default)
* `python_requests`
* `ruby_native` (default)
* `shell_curl` (default)
* `shell_httpie`
* `shell_wget`
* `swift_nsurlsession` (default)

If only the language is provided (e.g., `c`), the default library will be selected.


License: MIT


