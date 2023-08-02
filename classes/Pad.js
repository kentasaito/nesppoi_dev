export class Pad {

	// コンストラクタ
	constructor(padIndex) {
		this.padIndex = padIndex;
		this.inputIndexes = [];
		this.keys = [];
		this.keydown = Array(8).fill(false);
		this.busy = false;

		for (let keyIndex = 0; keyIndex < 8; keyIndex++) {
			this.inputIndexes[keyIndex] = localStorage.getItem(`pads${this.padIndex}_keys${keyIndex}`);
			document.querySelector(`#pads${this.padIndex} .keys${keyIndex}`).value = this.keys[keyIndex];
			this.keys[keyIndex] = localStorage.getItem(`keyboardPads${this.padIndex}_keys${keyIndex}`);
			document.querySelector(`#keyboardPads${this.padIndex} .keys${keyIndex}`).value = this.keys[keyIndex];
		}

		document.addEventListener('keydown', () => {
			const keyIndex = this.keys.indexOf(event.key);
			if (keyIndex >= 0) {
				if (!this.keydown[keyIndex]) {
					this.keydown[keyIndex] = true;
				}
			}
		});
		document.addEventListener('keyup', () => {
			const keyIndex = this.keys.indexOf(event.key);
			if (keyIndex >= 0) {
				this.keydown[keyIndex] = false;
			}
		});

		Object.defineProperty(this, 'axes', {
			get: () => {
				return {
					x: this.gamepad && this.inputIndexes[0] && this.inputIndexes[1] && ((this.gamepad.axes[this.inputIndexes[0][0]] === this.inputIndexes[0][1]) - (this.gamepad.axes[this.inputIndexes[1][0]] === this.inputIndexes[1][1])) || this.keydown[0] - this.keydown[1],
					y: this.gamepad && this.inputIndexes[2] && this.inputIndexes[3] && ((this.gamepad.axes[this.inputIndexes[2][0]] === this.inputIndexes[2][1]) - (this.gamepad.axes[this.inputIndexes[3][0]] === this.inputIndexes[3][1])) || this.keydown[2] - this.keydown[3],
				}
			},
		});

		Object.defineProperty(this, 'buttons', {
			get: () => {
				return {
					select: this.gamepad && this.gamepad.buttons[this.inputIndexes[4]] && this.gamepad.buttons[this.inputIndexes[4]].pressed || this.keydown[4],
					start: this.gamepad && this.gamepad.buttons[this.inputIndexes[5]] && this.gamepad.buttons[this.inputIndexes[5]].pressed || this.keydown[5],
					b: this.gamepad && this.gamepad.buttons[this.inputIndexes[6]] && this.gamepad.buttons[this.inputIndexes[6]].pressed || this.keydown[6],
					a: this.gamepad && this.gamepad.buttons[this.inputIndexes[7]] && this.gamepad.buttons[this.inputIndexes[7]].pressed || this.keydown[7],
				}
			},
		});
	}

	// キー設定
	configKey(keyIndex, key) {
		this.keys[keyIndex] = key;
		localStorage.setItem(`keyboardPads${this.padIndex}_keys${keyIndex}`, this.keys[keyIndex]);
		document.querySelector(`#keyboardPads${this.padIndex} .keys${keyIndex}`).value = this.keys[keyIndex];
		document.querySelector(`#keyboardPads${this.padIndex} .keys${keyIndex}`).blur();
		if (keyIndex + 1 < 8) {
			document.querySelector(`#keyboardPads${this.padIndex} .keys${(keyIndex + 1) % 8}`).focus();
		}
	}

	// パッド設定
	setup() {
		if (!this.setupIndex) {
			this.setupIndex = 0;
			document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).focus();
		}
		if (this.gamepad) {
			let stillBusy = false;
			if (this.busy) {
				for (const value of this.gamepad.axes) {
					if (value) stillBusy = true;
				}
				for (const button of this.gamepad.buttons) {
					if (button.pressed) stillBusy = true;
				}
			}
			if (!stillBusy) this.busy = false;

			if (this.setupIndex < 4) {
				for (const [axesIndex, value] of this.gamepad.axes.entries()) {
					if (!this.busy && value) {
						this.inputIndexes[this.setupIndex] = [axesIndex, value];
						document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).value = JSON.stringify([axesIndex, value]);
						this.setupIndex++;
						document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).focus();
						this.busy = true;
						break;
					}
				}
			} else {
				for (const [buttonIndex, button] of this.gamepad.buttons.entries()) {
					if (!this.busy && button.pressed) {
						this.inputIndexes[this.setupIndex] = buttonIndex;
						document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).value = buttonIndex;
						document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).blur();
						this.setupIndex++;
						if (this.setupIndex < 8) {
							document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).focus();
							this.busy = true;
						} else {
							this.busy = false;
							delete this.setupIndex;
						}
						break;
					}
				}
			}
		}
	}
}
