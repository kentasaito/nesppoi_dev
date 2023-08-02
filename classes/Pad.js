export class Pad {

	// コンストラクタ
	constructor(padIndex) {
		this.padIndex = padIndex;
		this.inputIndexes = [];
		this.keys = [];
		this.keydown = Array(8).fill(false);
		this.busy = false;

		for (let keyIndex = 0; keyIndex < 8; keyIndex++) {
			this.inputIndexes[keyIndex] = JSON.parse(localStorage.getItem(`pads${this.padIndex}_keys${keyIndex}`));
			document.querySelector(`#pads${this.padIndex} .keys${keyIndex}`).value = JSON.stringify(this.inputIndexes[keyIndex]);
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
					x: this.gamepad && this.inputIndexes[0] && this.inputIndexes[1] && ((this.gamepad.axes[this.inputIndexes[1][0]] === this.inputIndexes[1][1]) - (this.gamepad.axes[this.inputIndexes[0][0]] === this.inputIndexes[0][1])) || this.keydown[1] - this.keydown[0],
					y: this.gamepad && this.inputIndexes[2] && this.inputIndexes[3] && ((this.gamepad.axes[this.inputIndexes[3][0]] === this.inputIndexes[3][1]) - (this.gamepad.axes[this.inputIndexes[2][0]] === this.inputIndexes[2][1])) || this.keydown[3] - this.keydown[2],
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
		document.querySelector(`#keyboardPads${this.padIndex} .keys${keyIndex}`).disabled = true;
		keyIndex++;
		if (keyIndex < 8) {
			document.querySelector(`#keyboardPads${this.padIndex} .keys${keyIndex}`).disabled = false;
			document.querySelector(`#keyboardPads${this.padIndex} .keys${keyIndex}`).focus();
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

			for (const [index, value] of this.gamepad[this.setupIndex < 4 ? 'axes' : 'buttons'].entries()) {
				if (!this.busy && (this.setupIndex < 4 ? value : value.pressed)) {
					this.inputIndexes[this.setupIndex] = (this.setupIndex < 4 ? [index, value] : index);
					localStorage.setItem(`pads${this.padIndex}_keys${this.setupIndex}`, JSON.stringify(this.inputIndexes[this.setupIndex]));
					document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).value = JSON.stringify(this.inputIndexes[this.setupIndex]);
					document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).blur();
					document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).disabled = true;
					this.setupIndex++;
					if (this.setupIndex < 8) {
						document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).disabled = false;
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
