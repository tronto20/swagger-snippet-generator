import { prepare } from './snippet-target';
import { RequestSnippetGeneratorPlugin } from './request-snippet-generator-plugin';
import { RequestSnippetStylingPlugin } from './request-snippet-styling-plugin';


const SnippetGenerator = (snippetTargets) => {
  const targets = snippetTargets.map(snippetTarget => prepare(snippetTarget))

  return () => [
    RequestSnippetGeneratorPlugin(targets),
    RequestSnippetStylingPlugin(targets),
  ]
}

export default SnippetGenerator;

// The if is only for when this is run from the browser
if (typeof window !== 'undefined') {
  // grab existing namespace object, or create a blank object
  // if it doesn't exist
  // replace/create the global namespace
  window.RequestSnippetGenerator = window.SnippetGenerator || SnippetGenerator;
}
