import { Channel } from './Channel.js';

export class Sound {

	static audioContext = window.AudioContext ? new window.AudioContext() : null;
	static sampleRate = this.audioContext ? this.audioContext.sampleRate : 44100;
	static channels = [];

	static addEffect(name, waves) {
		while (this.channels.length < waves.length) {
			this.channels.push(new Channel());
		}
		for (const [c, channel] of this.channels.entries()) {
			if (waves[c] && waves[c].data.length) {
				channel.addEffect(name, waves[c].data);
			}
		}
	}

	static startEffect(name) {
		for (const channel of this.channels) {
			channel.startEffect(name);
		}
	}

	static stopEffect() {
		for (const channel of this.channels) {
			channel.stopEffect();
		}
	}

	static addBackground(name, waves) {
		while (this.channels.length < waves.length) {
			this.channels.push(new Channel());
		}
		for (const [c, channel] of this.channels.entries()) {
			if (waves[c] && waves[c].data.length) {
				channel.addBackground(name, waves[c].data);
			}
		}
	}

	static startBackground(name) {
		for (const channel of this.channels) {
			channel.startBackground(name);
		}
	}

	static stopBackground() {
		for (const channel of this.channels) {
			channel.stopBackground();
		}
	}
}
