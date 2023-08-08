import { Sound } from './Sound.js';

export class Wave {

	constructor(type) {
		this.type = type;
		this.theta = 0;
		this.sweepAmount = 1;
		this.data = [];
	}

	setGain(gain) {
		this.gain = gain / 15;
	}

	setDuty(duty) {
		this.duty = [Math.PI / 4, Math.PI / 2, Math.PI][duty];
	}

	setEnvelopeEnabled(envelopeEnabled) {
		this.envelopeEnabled = envelopeEnabled;
	}

	setEnvelopePeriod(envelopePeriod) {
		this.envelopePeriod = 32 * 8 / (envelopePeriod + 1);
	}

	setEnvelopeLoop(envelopeLoop) {
		this.envelopeLoop = envelopeLoop;
	}

	setSweepEnabled(sweepEnabled) {
		this.sweepEnabled = sweepEnabled;
	}

	setSweepPeriod(sweepPeriod) {
		this.sweepPeriod = Sound.sampleRate * (sweepPeriod + 1) / 120;
	}

	setSweepAmount(sweepAmount) {
		this.sweepAmount = 1 - Math.sign(sweepAmount) * 2 ** -Math.abs(sweepAmount);
	}

	noteOff(frames) {
		this.theta = 0;
		for (let t = 0; t < Sound.sampleRate * frames / 60; t++) {
			this.data.push(0);
		}
	}

	noteOn(frames, noteNumber) {
		let frequency = 440 * 2 ** ((noteNumber - 69) / 12);
		let gain = this.envelopeEnabled ? 1 : this.gain;
		for (let t = 0; t < Sound.sampleRate * frames / 60; t++) {
			if (frequency < 14000 && frequency > 20) {
				const amplitude = Math.max(-1, Math.min(1, this._amplitude(gain)));
				this.theta += 2 * Math.PI * frequency / Sound.sampleRate;
				this.data.push(amplitude);
				if (this.envelopeEnabled) {
					if (!this.envelopeLoop && t * this.envelopePeriod / Sound.sampleRate >= 15) {
						gain = 0;
					} else {
						gain = 1 - (t * this.envelopePeriod / Sound.sampleRate % 16) / 15;
					}
				}
				if (this.sweepEnabled && (t + 1) % this.sweepPeriod === 0) {
					frequency /= this.sweepAmount;
				}
			} else {
				this.data.push(0);
			}
		}
	}

	_amplitude(gain) {
		switch (this.type) {
		case 'sine':
			return gain * Math.sin(this.theta);
			break;
		case 'pulse':
			return gain * (this.theta % (2 * Math.PI) < this.duty ? 1 : -1);
			break;
		}
	}
}
