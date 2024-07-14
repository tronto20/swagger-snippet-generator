/**
 * request-snippet
 *
 * Generates code snippets from request data
 *
 * Author: Erik Wittern, tronto20
 * License: MIT
 */
'use strict';

import * as HTTPSnippet from 'httpsnippet';

/**
 * Return snippets for endpoint identified using path and method in the given
 * OpenAPI document.
 *
 * @param {string} url     url, e.g., 'http://localhost:8080/users'
 * @param {string} method   HTTP method identifying endpoint, e.g., 'get'
 * @param {array} targets   List of languages to create snippets in, e.g,
 *                          ['cURL', 'Node']
 * @param {object} queryParams   Optional: Values for the query parameters if present, e.g. { foo: "bar" }
 * @param  {object} inputHeaders       Optional: Values for the headers if present. e.g. { authorization: "Bearer TOKEN" }
 * @param {string} body Optional: Values for the body text if present. e.g. "{ \"foo\": \"bar\" }"
 */
const getRequestSnippets = function(url, method, targets, queryParams, inputHeaders, body) {
  const hars = createHar(url, method, queryParams, inputHeaders, body);

  const snippets = [];
  for (const har of hars) {
    const snippet = new HTTPSnippet.HTTPSnippet(har);
    snippets.push(
      ...getSnippetsForTargets(
        targets,
        snippet,
        har.postData.mimeType ? har.postData.mimeType : undefined
      )
    );
  }
  // use first element since method, url, and description
  // are the same for all elements
  return {
    method: hars[0].method,
    url: hars[0].url,
    description: hars[0].description,
    resource: getResourceName(hars[0].url),
    snippets: snippets
  };
};


/**
 * Determines the name of the resource exposed by the method.
 * E.g., ../users/{userId} --> users
 *
 * @param  {string} urlStr The OpenAPI path definition
 * @return {string}        The determined resource name
 */
const getResourceName = function(urlStr) {
  const pathComponents = urlStr.split('/');
  for (let i = pathComponents.length - 1; i >= 0; i--) {
    const cand = pathComponents[i];
    if (cand !== '' && !/^{/.test(cand)) {
      return cand;
    }
  }
};

/**
 * Format the given target by splitting up language and library and making sure
 * that HTTP Snippet supports them.
 *
 * @param  {string} targetStr String defining a target, e.g., node_request
 * @return {object}           Object with formatted target, or null
 */
const formatTarget = function(targetStr) {
  const language = targetStr.split('_')[0];
  const title = capitalizeFirstLetter(language);
  let library = targetStr.split('_')[1];

  const validTargets = HTTPSnippet.availableTargets();
  let validLanguage = false;
  let validLibrary = false;
  for (let i in validTargets) {
    const target = validTargets[i];
    if (language === target.key) {
      validLanguage = true;
      if (typeof library === 'undefined') {
        library = target.default;
        validLibrary = true;
      } else {
        for (let j in target.clients) {
          const client = target.clients[j];
          if (library === client.key) {
            validLibrary = true;
            break;
          }
        }
      }
    }
  }

  if (!validLanguage || !validLibrary) {
    return null;
  }

  return {
    title:
      typeof library !== 'undefined'
        ? title + ' + ' + capitalizeFirstLetter(library)
        : title,
    language,
    library
  };
};

/**
 * Generate code snippets for each of the supplied targets
 *
 * @param targets {array}               List of language targets to generate code for
 * @param snippet {Object}              Snippet object from httpsnippet to convert into the target objects
 * @param mimeType {string | undefined} Additional information to add uniqueness to the produced snippets
 */
const getSnippetsForTargets = function(targets, snippet, mimeType) {
  const snippets = [];
  for (let j in targets) {
    const target = formatTarget(targets[j]);
    if (!target) throw new Error('Invalid target: ' + targets[j]);
    snippets.push({
      id: targets[j],
      ...(mimeType !== undefined && { mimeType: mimeType }),
      title: target.title,
      content: snippet.convert(
        target.language,
        typeof target.library !== 'undefined' ? target.library : null
      )
    });
  }
  return snippets;
};

const capitalizeFirstLetter = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export { getRequestSnippets };

// The if is only for when this is run from the browser
if (typeof window !== 'undefined') {
  // grab existing namespace object, or create a blank object
  // if it doesn't exist
  window.RequestSnippets = window.RequestSnippets || {
    getRequestSnippets: getRequestSnippets
  };

  // replace/create the global namespace
  window.RequestSnippets = RequestSnippets;
}

/**
 *  Create HAR parameter array from object
 *
 *  @param {object} obj object for translate. e.g. { foo: "bar" }
 *  @return {array} HAR parameter. { name: "foo", value: "bar" }
 */
const objectToHarParam = function(obj) {
  const value = [];
  for (const key in obj) {
    value.push({
      name: key,
      value: obj[key]
    });
  }
  return value;
};

/**
 * Create HAR Request object for path and method pair described in given Values
 * See more:
 *  - http://swagger.io/specification/
 *  - http://www.softwareishard.com/blog/har-12-spec/#request
 *
 * Example HAR Request Object:
 * "request": {
 *   "method": "GET",
 *   "url": "http://www.example.com/path/?param=value",
 *   "httpVersion": "HTTP/1.1",
 *   "cookies": [],
 *   "headers": [],
 *   "queryString" : [],
 *   "postData" : {
 *     mimeType: "application/json"
 *   },
 *   "headersSize" : 0,
 *   "bodySize" : 0,
 *   "comment" : ""
 * }
 *
 * @param  {Object} url               full url
 * @param  {string} method            Key of the method
 * @param  {Object} queryParams  Optional: Values for the query parameters if present. e.g. { foo: "bar" }
 * @param  {Object} inputHeaders       Optional: Values for the headers if present. e.g. {  authorization: "Bearer TOKEN" }
 * @param  {string} body          Optional: Values for the body if present. e.g. "{ \"foo\": \"bar\" }"
 * @return {array}                    List of HAR Request objects for the endpoint
 */
const createHar = function(url, method, queryParams, inputHeaders, body) {
  // if the operational parameters are not provided, initialize them
  if (typeof queryParams === 'undefined') {
    queryParams = {};
  }
  if (typeof inputHeaders === 'undefined') {
    inputHeaders = {};
  }
  if (typeof body === 'undefined') {
    body = '';
  }
  const headers = objectToHarParam(inputHeaders);
  let postData = {
    mimeType: ''
  };
  if (body.length > 0) {
    postData = {};
    const mimeTypeHeader = headers.find((header) => typeof header.name === 'string' && header.name.toLowerCase() === 'content-type');
    if (mimeTypeHeader !== undefined)
      postData.mimeType = mimeTypeHeader.value;
    else
      postData.mimeType = 'application/octet-stream';
    postData.text = body;
  }
  const baseHar = {
    method: method.toUpperCase(),
    url: url,
    headers: objectToHarParam(inputHeaders),
    queryString: objectToHarParam(queryParams),
    httpVersion: 'HTTP/1.1',
    cookies: objectToHarParam({}),
    headersSize: 0,
    bodySize: 0,
    postData: postData
  };

  return [baseHar];
};
