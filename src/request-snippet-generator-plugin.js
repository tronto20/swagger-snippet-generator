import { getRequestSnippets } from './request-snippets';

const ExtendArray = (array) => {
  return {
    first: () => array[0],
    last: () => array[array.length - 1]
  };
};
//
const OrderedMapLike = (/* [key, value] */ array) => {
  const map = new Map();
  array.forEach(item => {
    map.set(item[0], item[1]);
  });
  return {
    get: (key) => map.get(key),
    keySeq: () => ExtendArray(array.map((value) => value[0])),
    entrySeq: () => array
  };
};

function getSnippetGenerators(snippetTargets) {
  return (Original, system) => (state, ...args) => {
    const result = Original(state, ...args);
    const resultCount = result.count();
    const array = new Array(resultCount + snippetTargets.length);
    let currentIndex = 0;
    result.entrySeq().forEach((item) => {
      array[currentIndex] = item;
      currentIndex++;
    });
    for (const snippetTarget of snippetTargets) {
      array[currentIndex] = [
        // key
        snippetTarget.target,
        // config and generator function
        system.Im.fromJS({
          title: snippetTarget.title,
          syntax: snippetTarget.syntax,
          fn: (req) => {
            // get extended info about request
            // const {path, method} = oasPathMethod;
            const method = req.get('method', '');
            const url = new URL(req.get('url', ''));
            const headers = req.get('headers');
            const body = req.get('body', '');
            const queryParams = {};
            url.searchParams.entries().forEach((item) => queryParams[item[0]] = item[1]);
            // run OpenAPISnippet for target node
            const targets = [snippetTarget.target];
            let snippet;
            try {
              // set request snippet content
              snippet = getRequestSnippets(
                url.href,
                method,
                targets,
                queryParams,
                headers ? headers.toObject() : {},
                body
              ).snippets[0].content;
            } catch (err) {
              console.error(err);
              // set to error in case it happens the npm package has some flaws
              snippet = 'snippet generation error. see console';
            }
            // return stringified snipped
            return snippet;
          }
        })
      ];
      currentIndex++;
    }
    return OrderedMapLike(array);
  };
}

// ref : https://github.com/swagger-api/swagger-ui/issues/7523
const RequestSnippetGeneratorPlugin = (snippetTargets) => {
  return () => ({
    statePlugins: {
      // extend the request snippets core plugin
      requestSnippets: {
        wrapSelectors: {
          // add additional snippet generators here
          getSnippetGenerators: getSnippetGenerators(snippetTargets)
        }
      }
    }
  });
};

export { RequestSnippetGeneratorPlugin };
