export class Channel {

	constructor(audio, c, type) {
		this.audio = audio;
		this.c = c;
		this.type = type;

		this.buffers = [];
		if (this.type === 'pulse') {
			for (let b = 0; b < 4; b++) {
				const n = 32;
				this.buffers[b] = this.audio.audioContext.createBuffer(1, 880 * n, 880 * n);
				const channelData = this.buffers[b].getChannelData(0);
				for (let i = 0; i < this.buffers[b].length; i++) {
					channelData[i] = i % n < n * [1, 2, 4, 6][b] / 8 ? 1 : -1;
				}
			}
		}
		if (this.type === 'triangle') {
			for (let b = 0; b < 1; b++) {
				const n = 32;
				this.buffers[b] = this.audio.audioContext.createBuffer(1, 880 * n, 880 * n);
				const channelData = this.buffers[b].getChannelData(0);
				for (let i = 0; i < this.buffers[b].length; i++) {
					channelData[i] = (i % n < 8 ? (i % n) + 8 : i % n < 24 ? 24 - (i % n) : (i % n) - 24) * 2 / 16 - 1;
				}
			}
			this.buffer = 0;
		}
		if (this.type === 'noise') {
			for (let b = 0; b < 1; b++) {
				const n = 32;
				this.buffers[b] = this.audio.audioContext.createBuffer(1, 32767 * n, 880 * n);
				const channelData = this.buffers[b].getChannelData(0);
				let reg = 0x8000;
				for (let i = 0; i < this.buffers[b].length; i++) {
					if (i % n === 0) {
						reg >>= 1;
						reg |= ((reg ^ (reg >> 1)) & 1) << 15;
					}
					channelData[i] = reg & 1 ? 1 : -1;
				}
			}
			this.buffer = 0;
		}

		this.gain = this.audio.audioContext.createGain();
		this.gain.connect(this.audio.channelGains[this.c]);
		this.registers = {pulse: [0x0f, 0x00, 0x7f, 0x08], triangle: [0x7f, 0x00, 0x7f, 0x08], noise: [0x0f, 0x00, 0x0f, 0x08]}[this.type];
		for (let r = 0; r < 4; r++) {
			this.setRegister(r, this.registers[r]);
		}
		this.noteOff();
		this.keyOff();
	}

	noteNumber(noteNumber) {
		if (noteNumber < 0) {
			this.noteOff();
		} else {
			if (this.type === 'noise') {
				this.setEntry('envelopePeriod', noteNumber >> 4);
				this.setEntry('frequency', noteNumber & 0x0f);
			} else {
				this.setEntry('frequency', Math.floor(0x7f * 2 ** ((81 - noteNumber) / 12)));
			}
			this.setEntry('length', this.length);
		}
	}

	keyOn() {
		this.keyOff();
		this.keyOnFlag = true;
		if (!this.loopEnable) {
			this.keyOffTimeoutId = setTimeout(() => {
				this.keyOff();
			}, this.audio.keyOffCount[this.length] * 1000 / 60);
		}
		this.noteOn();
	}

	noteOn() {
		this.noteOff();
		if (!(this.type !== 'noise' && this.frequency === 0 || this.type === 'pulse' && this.frequency < 8 || this.type === 'triangle' && this.duration === 0)) {
			this.noteOnFlag = true;

			this.bufferSource = this.audio.audioContext.createBufferSource();
			this.bufferSource.buffer = this.buffers[this.buffer];
			this.bufferSource.loop = true;
			this.setBufferSourceFrequency();
			this.bufferSource.connect(this.gain);
			this.bufferSource.start();

			if (['pulse', 'noise'].includes(this.type)) {
				if (this.envelopeDisable) {
					this.gain.gain.value = this.envelopePeriod / 15;
				} else {
					this.setEnvelope();
				}
			}

			if (!this.loopEnable) {
				this.noteOffTimeoutId = setTimeout(() => {
					this.noteOff();
				}, (this.type === 'triangle' ? Math.min(this.duration / 4, this.audio.keyOffCount[this.length]) : this.audio.keyOffCount[this.length]) * 1000 / 60);
			}
		}
	}

	noteOff() {
		if (this.noteOnFlag) {
			this.noteOnFlag = false;

			clearInterval(this.envelopeIntervalId);
			delete this.envelopeIntervalId;
			this.gain.gain.cancelScheduledValues(0);
			clearTimeout(this.noteOffTimeoutId);

			this.bufferSource.stop();
			this.bufferSource.disconnect();
			delete this.bufferSource;
		}
	}

	keyOff() {
		if (this.keyOnFlag) {
			this.keyOnFlag = false;
			clearTimeout(this.keyOffTimeoutId);
		}
	}

	setEnvelope() {
		this.gain.gain.cancelScheduledValues(0);
		this.gain.gain.setValueAtTime(1, this.audio.audioContext.currentTime);
		this.gain.gain.linearRampToValueAtTime(0, this.audio.audioContext.currentTime + (this.envelopePeriod + 1) * 4 / 60);
		if (this.loopEnable && !this.envelopeIntervalId) {
			this.envelopeIntervalId = setInterval(() => {
				this.setEnvelope();
			}, (this.envelopePeriod + 1) * 4 * 1000 / 60);
		}
	}

	setBufferSourceFrequency() {
		if (this.bufferSource) {
			if (this.type === 'pulse') {
				this.bufferSource.playbackRate.value = 0x7f / this.frequency;
			}
			if (this.type === 'triangle') {
				this.bufferSource.playbackRate.value = 0x3f / this.frequency;
			}
			if (this.type === 'noise') {
				this.bufferSource.playbackRate.value = [1017, 508.5, 254.25, 127.125, 63.5625, 42.375, 31.78125, 25.425, 20.1386138613861, 16.0157480314961, 10.7052631578947, 8.00787401574803, 5.33858267716535, 4.00393700787402, 2, 1][this.frequency];
			}
		}
	}

	setEntry(name, value, skipSetRegisters) {
		this[name] = parseInt(value);
		if (!skipSetRegisters) {
			switch (name) {
			case 'buffer':
				if (['pulse'].includes(this.type)) {
					this.setRegister(0, this.registers[0] & 0x3f | (this[name] << 6), true);
				}
				break;
			case 'loopEnable':
				if (['pulse', 'noise'].includes(this.type)) {
					this.setRegister(0, this.registers[0] & 0xdf | (this[name] << 5), true);
				}
				if (['triangle'].includes(this.type)) {
					this.setRegister(0, this.registers[0] & 0x7f | (this[name] << 7), true);
				}
				if (!this[name]) {
					this.noteOff();
					this.keyOff();
				}
				break;
			case 'envelopeDisable':
				if (['pulse', 'noise'].includes(this.type)) {
					this.setRegister(0, this.registers[0] & 0xef | (this[name] << 4), true);
				}
				break;
			case 'envelopePeriod':
				if (['pulse', 'noise'].includes(this.type)) {
					this.setRegister(0, this.registers[0] & 0xf0 | (this[name] << 0), true);
				}
				break;
			case 'duration':
				if (['triangle'].includes(this.type)) {
					this.setRegister(0, this.registers[0] & 0x80 | (this[name] << 0), true);
					if (!this[name]) {
						this.noteOff();
					}
					if (this.loopEnable && this[name]) {
						this.noteOn();
					}
				}
				break;
			case 'sweepEnable':
				if (['pulse'].includes(this.type)) {
					this.setRegister(1, this.registers[1] & 0x7f | (this[name] << 7), true);
				}
				break;
			case 'sweepPeriod':
				if (['pulse'].includes(this.type)) {
					this.setRegister(1, this.registers[1] & 0x8f | (this[name] << 4), true);
				}
				break;
			case 'sweepDirection':
				if (['pulse'].includes(this.type)) {
					this.setRegister(1, this.registers[1] & 0xf7 | (this[name] << 3), true);
				}
				break;
			case 'sweepDelta':
				if (['pulse'].includes(this.type)) {
					this.setRegister(1, this.registers[1] & 0xf8 | (this[name] << 0), true);
				}
				break;
			case 'frequency':
				if (['pulse', 'triangle'].includes(this.type)) {
					this.setRegister(2, this.registers[2] & 0x00 | (this[name] & 0xff), true);
					this.setRegister(3, this.registers[3] & 0xf8 | (this[name] >> 8), true);
				}
				if (['noise'].includes(this.type)) {
					this.setRegister(2, this.registers[2] & 0xf0 | (this[name] & 0x0f), true);
				}
				this.setBufferSourceFrequency();
				break;
			case 'length':
				this.setRegister(3, this.registers[3] & 0x07 | (this[name] << 3), true);
				break;
			}
		}
	}

	setRegister(r, value, skipSetEntries) {
		this.registers[r] = parseInt(value);
		if (!skipSetEntries) {
			if (this.type === 'pulse') {
				switch (r) {
				case 0:
					this.setEntry('buffer', this.registers[r] >> 6, true);
					this.setEntry('loopEnable', this.registers[r] >> 5 & 0x01, true);
					this.setEntry('envelopeDisable', this.registers[r] >> 4 & 0x01, true);
					this.setEntry('envelopePeriod', this.registers[r] >> 0 & 0x0f, true);
					break;
				case 1:
					this.setEntry('sweepEnable', this.registers[r] >> 7, true);
					this.setEntry('sweepPeriod', this.registers[r] >> 4 & 0x07, true);
					this.setEntry('sweepDirection', this.registers[r] >> 3 & 0x01, true);
					this.setEntry('sweepDelta', this.registers[r] >> 0 & 0x07, true);
					break;
				case 2:
					this.setEntry('frequency', this.frequency & 0x700 | this.registers[r], true);
					break;
				case 3:
					this.setEntry('frequency', this.frequency & 0xff | (this.registers[r] & 0x07) << 8, true);
					this.setEntry('length', this.registers[r] >> 3, true);
					break;
				}
			}
			if (this.type === 'triangle') {
				switch (r) {
				case 0:
					this.setEntry('loopEnable', this.registers[r] >> 7 & 0x01, true);
					this.setEntry('duration', this.registers[r] >> 0 & 0x7f, true);
					break;
				case 2:
					this.setEntry('frequency', this.frequency & 0x700 | this.registers[r], true);
					break;
				case 3:
					this.setEntry('frequency', this.frequency & 0xff | (this.registers[r] & 0x07) << 8, true);
					this.setEntry('length', this.registers[r] >> 3, true);
					break;
				}
			}
			if (this.type === 'noise') {
				switch (r) {
				case 0:
					this.setEntry('loopEnable', this.registers[r] >> 5 & 0x01, true);
					this.setEntry('envelopeDisable', this.registers[r] >> 4 & 0x01, true);
					this.setEntry('envelopePeriod', this.registers[r] >> 0 & 0x0f, true);
					break;
				case 2:
					this.setEntry('frequency', this.frequency & 0xf0 | this.registers[r], true);
					break;
				case 3:
					this.setEntry('length', this.registers[r] >> 3, true);
					break;
				}
			}
		}
		if (r === 3) {
			this.keyOn();
		}
	}
}
