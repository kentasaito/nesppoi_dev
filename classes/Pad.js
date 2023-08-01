export class Pad {

	// コンストラクタ
	constructor(padIndex) {
		this.padIndex = padIndex;
		this.keys = [];
		this.keydown = Array(8).fill(false);
		this.keydowned = Array(8).fill(false);
		this.buttons = Array(8).fill(false);

		for (let keyIndex = 0; keyIndex < 8; keyIndex++) {
			this.keys[keyIndex] = localStorage.getItem(`pads${this.padIndex}_keys${keyIndex}`);
			document.querySelector(`#pads${this.padIndex} .keys${keyIndex}`).value = this.keys[keyIndex];
		}

		document.addEventListener('keydown', () => {
			const buttonIndex = this.keys.indexOf(event.key);
			if (buttonIndex >= 0) {
				if (!this.keydown[buttonIndex]) {
					this.keydown[buttonIndex] = true;
					this.keydowned[buttonIndex] = true;
				}
			}
		});
		document.addEventListener('keyup', () => {
			const buttonIndex = this.keys.indexOf(event.key);
			if (buttonIndex >= 0) {
				this.keydown[buttonIndex] = false;
			}
		});
	}

	// キー設定
	configKey(keyIndex, key) {
		this.keys[keyIndex] = key;
		localStorage.setItem(`pads${this.padIndex}_keys${keyIndex}`, this.keys[keyIndex]);
		document.querySelector(`#pads${this.padIndex} .keys${keyIndex}`).value = this.keys[keyIndex];
		document.querySelector(`#pads${this.padIndex} .keys${keyIndex}`).blur();
		if (keyIndex + 1 < 8) {
			document.querySelector(`#pads${this.padIndex} .keys${(keyIndex + 1) % 8}`).focus();
		}
	}

	/* Systemからしか呼ばれない準プライベートメソッド */
	// フレーム時
	onFrame() {
		for (const [buttonIndex, button] of this.buttons.entries()) {
			this.buttons[buttonIndex] = this.keydown[buttonIndex] || this.keydowned[buttonIndex];
			this.keydowned[buttonIndex] = false;
		}
	}}
