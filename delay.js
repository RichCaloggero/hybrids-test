import {define, html, property} from "./hybrids/index.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = {
delay: {default: 0.5, min: 0, max: 1, step: 0.001}
};

const Delay = element.create("delay", defaults, "createDelay", [["delay", "delayTime"]], {

render: ({ mix, bypass, label, _depth, delay }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="delay">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}
${ui.number("delay", "delay", delay, defaults)}
</fieldset>
`; // template
} // render
});

define ("audio-delay", Delay);
