import { Sound } from './Sound.js';

export class Channel {

	constructor() {
		this.effects = {};
		this.backgrounds = {};
		this.effectGain = Sound.audioContext.createGain();
		this.effectGain.gain.value = 1 / 4;
		this.backgroundGain = Sound.audioContext.createGain();
		this.backgroundGain.gain.value = 1 / 4;
	}

	addEffect(name, data) {
		this.effects[name] = Sound.audioContext.createBuffer(1, data.length, Sound.sampleRate);
		const channelData = this.effects[name].getChannelData(0);
		for (let i = 0; i < data.length; i++) {
			channelData[i] = data[i];
		}
	}

	startEffect(name) {
		if (this.effects[name]) {
			if (this.backgroundPlaying) {
				this._muteBackground(this.effects[name].length / Sound.sampleRate);
			}
			if (this.effectPlaying) {
				this.stopEffect();
			}
		  const bufferSource = Sound.audioContext.createBufferSource();
			bufferSource.buffer = this.effects[name];
			this.effectPlaying = bufferSource;
			this.effectPlaying.connect(this.effectGain);
			this.effectGain.connect(Sound.audioContext.destination);
			this.effectPlaying.start();
		}
	}

	stopEffect() {
		if (this.effectPlaying) {
			this.effectPlaying.stop();
			delete this.effectPlaying;
		}
	}

	addBackground(name, data) {
		this.backgrounds[name] = Sound.audioContext.createBuffer(1, data.length, Sound.sampleRate);
		const channelData = this.backgrounds[name].getChannelData(0);
		for (let i = 0; i < data.length; i++) {
			channelData[i] = data[i];
		}
	}

	startBackground(name) {
		if (this.backgrounds[name]) {
			if (this.backgroundPlaying) {
				this.stopBackground();
			}
		  const bufferSource = Sound.audioContext.createBufferSource();
			bufferSource.loop = true;
			bufferSource.buffer = this.backgrounds[name];
			this.backgroundPlaying = bufferSource;
			this.backgroundPlaying.connect(this.backgroundGain);
			this.backgroundGain.connect(Sound.audioContext.destination);
			this.backgroundPlaying.start();
		}
	}

	stopBackground() {
		if (this.backgroundPlaying) {
			this.backgroundPlaying.stop();
			delete this.backgroundPlaying;
		}
	}

	_muteBackground(duration) {
		this.backgroundGain.gain.cancelScheduledValues(0);
		this.backgroundGain.gain.setValueAtTime(1 / 4, Sound.audioContext.currentTime + duration);
		this.backgroundGain.gain.setValueAtTime(0, 0);
	}
}
