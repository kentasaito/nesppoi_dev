import { System } from '../../System.js';
import { Channel } from './Channel.js';

export class Audio {

	static keyOffCount = [0x05, 0x7f, 0x0a, 0x01, 0x14, 0x02, 0x28, 0x03, 0x50, 0x04, 0x1e, 0x05, 0x07, 0x06, 0x0d, 0x07, 0x06, 0x08, 0x0c, 0x09, 0x18, 0x0a, 0x30, 0x0b, 0x60, 0x0c, 0x24, 0x0d, 0x08, 0x0e, 0x10, 0x0f];

	static onStart() {
		this.audioContext = new AudioContext();
		this.channelGains = [];
		this.channels = [];
		this.masterGain = this.audioContext.createGain();
		this.masterGain.gain.value = 0.5;
		this.masterGain.connect(this.audioContext.destination);
		for (let c = 0; c < 4; c++) {
			this.channelGains[c] = this.audioContext.createGain();
			this.channelGains[c].gain.value = [0.3, 0.3, 1.0, 0.3][c];
			this.channelGains[c].connect(this.masterGain);
			this.channels[c] = new Channel(this, c, ['pulse', 'pulse', 'triangle', 'noise'][c]);
		}
	}

	static onFrame() {
		if (this.bgmData !== undefined) {
			for (let c = 0; c < 4; c++) {
				while (this.bgmData[c][this.bgmIndexes[c]] && this.bgmData[c][this.bgmIndexes[c]][0] <= System.t) {
					if ([0, 1, 2, 3].includes(this.bgmData[c][this.bgmIndexes[c]][2])) {
						this.channels[c].setRegister(parseInt(this.bgmData[c][this.bgmIndexes[c]][2]), this.bgmData[c][this.bgmIndexes[c]][1]);
					} else if (this.bgmData[c][this.bgmIndexes[c]][2]) {
						this.channels[c].setEntry(this.bgmData[c][this.bgmIndexes[c]][2], this.bgmData[c][this.bgmIndexes[c]][1]);
					} else {
						this.channels[c].noteNumber(this.bgmData[c][this.bgmIndexes[c]][1]);
					}
					this.bgmIndexes[c]++;
				}
			}
			if (System.t >= this.bgmEnd) {
				this.bgmEnd = System.t + this.bgmPrescale * this.bgmCount;
				for (let c = 0; c < 4; c++) {
					for (const data of this.bgmData[c]) {
						data[0] += this.bgmPrescale * this.bgmCount;
					}
					this.bgmIndexes[c] = 0;
				}
			}
		}
	}

	static mute() {
		for (let c = 0; c < 4; c++) {
			this.channels[c].noteOff();
			this.channels[c].keyOff();
		}
	}

	static setBgm(prescale, count, bgmData) {
		this.clearBgm();
		this.bgmPrescale = prescale;
		this.bgmCount = count;
		this.bgmData = bgmData;
		this.bgmIndexes = [];
		this.bgmEnd = System.t + 1 + this.bgmPrescale * this.bgmCount;
		for (let c = 0; c < 4; c++) {
			let t = System.t + 1;
			for (const data of this.bgmData[c]) {
				const buf = data[0];
				data[0] = t;
				t += buf * this.bgmPrescale;
			}
			this.bgmIndexes[c] = 0;
		}
	}

	static clearBgm() {
		this.channels[0].noteOff();
		this.channels[0].keyOff();
		delete this.bgmIndexes;
		delete this.bgmData;
	}
}
