import { define } from '../define.js';
import { VERSION } from '../version.js';
import { AgentFlowChat } from './element.js';

// `document.currentScript` is set only while this script evaluates.
const script = document.currentScript;
if (script instanceof HTMLScriptElement && script.src) AgentFlowChat.scriptOrigin = new URL(script.src, location.href).origin;

define(customElements, { 'agentflow-chat': { element: AgentFlowChat } }, 'elementsVersion', VERSION, 'chat');
