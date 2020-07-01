/* this does two things:
- sends tick messages every automationInterval
- sends averages of sample values (all sample values are absolute values since webaudio samples range from -1 to 1, inclusive):
+ channelAverage[]: average absolute sample values of each channel over this frame
+ frameAverage: average sample value over this frame combining both channels
+ lastFrameAverage[]: queue containing frameAverage values for the last queueLength frames
+ average: average of the current queue
*/

class Automator extends AudioWorkletProcessor {

constructor () {
super ();
this.channelAverage = [];
this.average = this.frameAverage = 0;
this.lastFrameAverages = [];
this.queueLength = 4;
this.frameCount = 0;
this.frameDuration = 0;
this.enable = false;
this.automationInterval = 0.1; // seconds
this.elapsedTime = 0;
this.startTime = currentTime;

this.port.onmessage = e => {
const data = e.data;
const name = data[0];
const value = data[1];
this[name] = value;
console.debug(`automator.worklet: parameter ${name} set to ${value}`);

if (this.enable) {
this.startTime = currentTime;
//console.debug(`automator.worklet: startTime reset to ${this.startTime}`);
} // if

}; // onMessage

console.log("automator.worklet initialized...");
} // constructor

process (inputs, outputs) {
const inputBuffer = inputs[0];
const outputBuffer = outputs[0];
const channelCount = inputBuffer.length;

if (channelCount > 0) {
const sampleCount = inputBuffer[0].length;
this.frameDuration = sampleCount / sampleRate;

this.frameCount += 1;
for (let channel = 0; channel < channelCount; channel++) {
this.channelAverage[channel] = absoluteSum(inputBuffer[channel]) / sampleCount;
} // loop over channels
this.frameAverage = absoluteSum(this.channelAverage)/channelCount;
this.average = (absoluteSum(this.lastFrameAverages) + this.frameAverage) / this.lastFrameAverages.length+1;
this.lastFrameAverages.push(this.frameAverage);
if (this.lastFrameAverages.length > this.queueLength) this.lastFrameAverages.shift();

} // if channelCount

if (this.enable) {
const dt = currentTime - this.startTime;

if (dt >= this.automationInterval) {
this.startTime = currentTime;
this.port.postMessage("tick");
//console.debug("automator.worklet: tick");
this.port.postMessage([
["channelAverage", this.channelAverage],
["frameAverage", this.frameAverage],
["average", this.average]
]); // message
} // if elapsedTime
} // if enabled

return true;
} // process
} // class Automator

registerProcessor("parameter-automator", Automator);

function absoluteSum (a) {return a.reduce((sum, x) => sum += Math.abs(x), 0);}

