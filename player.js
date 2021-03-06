import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as app from "./app.js";
import * as ui from "./ui.js";

const defaults = {};

const Player = element.create("player", defaults, initialize, {

src: {
get: (host, value) => host.audioElement.src,
set: (host, value) => {
try {
host.audioElement.src = value;
return value;
} catch (e) {
app.statusMessage(e);
} // try
}, // set
connect: (host, key) => host[key] = element.processAttribute(host, key) || "",
}, // src

play: {
connect: (host, key) => element.getDefault(host, key) || false,
observe: (host, value) => {
if (value) host.audioElement.play();
else host.audioElement.pause();
} // observe
}, // play


seek: {
connect: (host, key) => element.getDefault(host, key) || 0,
observe: (host, value) => host.audioElement.currentTime = Number(value)
}, // seek

duration: {
get: (host, value) => host.audioElement.duration,
set: (host, value) => value,
}, // duration

currentTime: 0,

render: ({ label, _depth, src, play, seek, currentTime, duration }) => {
//console.debug(`${label}: rendering...`);
return html`
<fieldset class="player">
${ui.legend({ label, _depth })}
${ui.text({ label: "source file", name: "src", defaultValue: src })}
${ui.boolean({ name: "play", defaultValue: play })}
<label>seek: <input type="range" value="${currentTime}" onchange="${html.set(`seek`)}" min="0" max="${duration}" step="2" data-name="seek"></label>
</fieldset>
`;
} // render
});

define ("audio-player", Player);


function initialize (host, key) {
host.input = null;
host.output = audio.context.createGain();
host.audioElement = document.createElement("audio");
host.audioElement.addEventListener ("error", e => app.statusMessage(e.target.error.message));
host.audioElement.addEventListener("ended", () => {
host.play = false;
host.currentTime = 0;
});

host.audioElement.addEventListener("durationchange", e => host.duration = e.target.duration);
host.audioElement.addEventListener("timeupdate", e => {
host.currentTime= Math.floor(e.target.currentTime / 2) * 2;
});

host.node = audio.context.createMediaElementSource(host.audioElement);
host.node.connect(host.output);

element.signalReady(host);

} // initialize
