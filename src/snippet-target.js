

const splitSnippetTarget = (snippetTarget) => {
  const splitIndex = snippetTarget.target.indexOf('_');
  if (splitIndex < 0)
    return {
      lang: snippetTarget.target
    };
  const lang = snippetTarget.target.substring(0, splitIndex);
  const lib = snippetTarget.target.substring(splitIndex + 1);
  return {
    lang: lang,
    lib: lib
  };
};

const getTitle = (snippetTarget) => {
  const { lang, lib } = splitSnippetTarget(snippetTarget);
  return snippetTarget.title ? snippetTarget.title : lib ? (lang + ' (' + lib + ')') : lang;
};

const syntaxTransform = {
  node: 'javascript'
};

const getSyntax = (snippetTarget) => {
  const { lang } = splitSnippetTarget(snippetTarget);
  return snippetTarget.syntax ? snippetTarget.syntax : (syntaxTransform[lang] ? syntaxTransform[lang] : lang);
};

/**
 * prepare SnippetTarget data
 *
 * create title and syntax from target if not present
 *
 * @param snippetTarget Snippet Target e.g. { title: string?, syntax: string?, target: string }
 * @returns {{syntax: (*|string), title: (string|string), target}}
 */
export const prepare = (snippetTarget) => {
  const messages = [];
  if (typeof snippetTarget.target !== 'string') {
    messages.push('target must be string');
  }
  if (!(typeof snippetTarget.syntax === 'string' || typeof snippetTarget.syntax === 'undefined')) {
    messages.push('syntax must be string or undefined :' + typeof snippetTarget.syntax);
  }
  if (!(typeof snippetTarget.title === 'string' || typeof snippetTarget.title === 'undefined')) {
    messages.push('title must be string or undefined :' + typeof snippetTarget.title);
  }
  if (messages.length > 0) {
    let errorMessage = 'validation failed';
    for (const msg of messages) {
      errorMessage = errorMessage + '\n  ' + msg;
    }
    throw SyntaxError(errorMessage);
  }

  return {
    title: getTitle(snippetTarget),
    syntax: getSyntax(snippetTarget),
    target: snippetTarget.target
  }
};
