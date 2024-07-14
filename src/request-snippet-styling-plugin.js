import { createElement } from 'react';
import ReactSyntaxHighlighter from 'react-syntax-highlighter/dist/esm/light';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import http from 'react-syntax-highlighter/dist/esm/languages/hljs/http';
import powershell from 'react-syntax-highlighter/dist/esm/languages/hljs/powershell';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';

const hljs = {
  json: json,
  xml: xml,
  bash: bash,
  yaml: yaml,
  http: http,
  powershell: powershell,
  javascript: javascript,
  java: java,
  python: python,
  go: go,
  php: php,
  typescript: typescript,
  cpp: cpp,
  rust: rust
};

const defaultSyntax = ['json', 'js', 'xml', 'yaml', 'http', 'bash', 'powershell', 'javascript'];
const transformSyntax = {
  js: 'javascript'
};

const configured = {};
const registerSyntax = (syntax) => {
  const name = transformSyntax[syntax] ? transformSyntax[syntax] : syntax;
  configured[syntax] && hljs[name] && ReactSyntaxHighlighter.registerLanguage(syntax, hljs[name]);
  configured[syntax] = true;
};

function loadSyntaxHighlighter(targetSnippets) {
  return () => {
    for (const syntax of defaultSyntax) {
      registerSyntax(syntax);
    }
    for (const targetSnippet of targetSnippets) {
      registerSyntax(targetSnippet.syntax);
    }
  };
}

function ManyTargetHighlightComponent(ori, sys) {
  return (props) => {
    const Original = ori(props);
    const generateHighlight = (
      {
        language,
        className = '',
        getConfigs,
        syntaxHighlighting = {},
        children = ''
      }
    ) => {
      const theme = getConfigs().syntaxHighlight.theme;
      const { styles, defaultStyle } = syntaxHighlighting;
      const style = styles?.[theme] ?? defaultStyle;
      return createElement(ReactSyntaxHighlighter, {
        lanuage: language,
        className: className,
        style: style
      }, children);
    };
    return {
      ...Original,
      type: generateHighlight
    };
  };
}

/**
 *  find container of 'class: btn'
 * @param component component
 * @return {boolean | object} if component has 'class: bt' return true. else if component is container return object else return false
 */
function findBtnContainer(component) {
  if (!component.props) {
    return false;
  }
  if (component.props.className && component.props.className.split(' ').find((name) => name === 'btn')) {
    return true;
  }
  let isContainer = false;
  for (const child of component.props.children[Symbol.iterator] ? component.props.children : []) {
    const result = findBtnContainer(child);
    if (typeof result === 'object') {
      return result;
    }
    isContainer = isContainer || result;
  }
  if (isContainer) {
    return component;
  } else {
    return false;
  }
}

/**
 *  find button container and styling
 * @param ori
 * @param sys
 * @return {function(*): *}
 * @constructor
 */
function RequestSnippetStylerComponent(ori, sys) {
  return (props) => {
    const Original = ori(props);
    const btnContainer = findBtnContainer(Original);
    if (typeof btnContainer === 'object') {
      btnContainer.props.style = {
        ...btnContainer.props.style,
        paddingLeft: '15px',
        paddingRight: '15px',
        paddingTop: '5px',
        overflow: 'auto'
      };
    }
    return Original;
  };
}


const RequestSnippetStylingPlugin = (snippetTargets) => {
  return () => ({
    afterLoad: loadSyntaxHighlighter(snippetTargets),
    wrapComponents: {
      SyntaxHighlighter: ManyTargetHighlightComponent,
      RequestSnippets: RequestSnippetStylerComponent
    }
  });
};

export { RequestSnippetStylingPlugin };
