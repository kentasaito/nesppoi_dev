export class Pad {

	// コンストラクタ
	constructor(padIndex) {
		this.padIndex = padIndex;
		this.keys = [];
		this.keydown = Array(8).fill(false);

		for (let keyIndex = 0; keyIndex < 8; keyIndex++) {
			this.keys[keyIndex] = localStorage.getItem(`keyboardPads${this.padIndex}_keys${keyIndex}`);
			document.querySelector(`#keyboardPads${this.padIndex} .keys${keyIndex}`).value = this.keys[keyIndex];
		}

		this.axesIndexes = [0, 1];
		this.axesValues = [1, -1];
		this.buttonIndexes = [8, 9, 0, 1];

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
					x: this.gamepad && ((this.gamepad.axes[this.axesIndexes[0]] === this.axesValues[0]) - (this.gamepad.axes[this.axesIndexes[0]] === this.axesValues[1])) || this.keydown[0] - this.keydown[1],
					y: this.gamepad && ((this.gamepad.axes[this.axesIndexes[1]] === this.axesValues[0]) - (this.gamepad.axes[this.axesIndexes[1]] === this.axesValues[1])) || this.keydown[2] - this.keydown[3],
				}
			},
		});

		Object.defineProperty(this, 'buttons', {
			get: () => {
				return {
					select: this.gamepad && this.gamepad.buttons[this.buttonIndexes[0]].pressed || this.keydown[4],
					start: this.gamepad && this.gamepad.buttons[this.buttonIndexes[1]].pressed || this.keydown[5],
					b: this.gamepad && this.gamepad.buttons[this.buttonIndexes[2]].pressed || this.keydown[6],
					a: this.gamepad && this.gamepad.buttons[this.buttonIndexes[3]].pressed || this.keydown[7],
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
		if (this.gamepad) {
			if (!this.setupIndex) {
				this.setupIndex = 0;
				document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).focus();
			}
			if (this.setupIndex < 4) {
				for (const [axesKey, value] of Object.entries(this.axes)) {
console.log(axesKey, value);
					if (value) {
this.
						this.setupIndex++;
						document.querySelector(`#pads${this.padIndex} .keys${this.setupIndex}`).focus();
						break;
					}
				}
			} else {
			}
		}
	}
}
