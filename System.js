import { Pad } from './classes/Pad.js';

export class System {

	// システム開始
	static start() {

		// スクリーン
		this.screen = document.getElementById('screen');
		document.getElementById('fullscreen').addEventListener('click', () => {
			if (document.fullscreenElement) {
				document.exitFullscreen();
			} else {
				this.screen.requestFullscreen();
			}
		});

		// ゲームパッド定義
		this.pads = [
			new Pad(0),
			new Pad(1),
		];

		// フレーム停止/再開
		document.addEventListener('keydown', () => {
			if (event.key === 'Escape') {
				if (this.AnimationFrameRequestId) {
					cancelAnimationFrame(this.AnimationFrameRequestId);
					delete this.AnimationFrameRequestId;
				} else {
					this._frame();
				}
			}
		});

		// デフォルトROMロード
		if (localStorage.getItem('romName')) {
			System.loadRom(localStorage.getItem('romName'));
		}
	}

	// ROMロード
	static async loadRom(romName) {
		const module = await import(`./roms/${romName}/Rom.js`);
		localStorage.setItem('romName', romName);
		this.screen.innerHTML = '';
		this.Rom = module.Rom;
		await this.Rom.onLoad(this);
		this._frame();
	}

	// 色セット
	static setColors(colors) {
		const style = document.createElement('style');
		document.head.appendChild(style);
		for (const [colorIndex, color] of colors.entries()) {
			style.sheet.insertRule(`:root { --colors-${colorIndex}: ${color}; }`);
		}
	}

	// パレットセット
	static setPalettes(palettes) {
		this.screen.style.backgroundColor = `var(--colors-${palettes[0][0]})`;
		const style = document.createElement('style');
		document.head.appendChild(style);
		for (let [paletteIndex, palette] of palettes.entries()) {
			for (let [fill, v] of palette.entries()) {
				style.sheet.insertRule(`[data-palette-index="${paletteIndex}"] [data-fill="${fill}"] { fill:var(--colors-${v}); }`);
			}
		}
	}

	// フレーム
	static _frame() {
		for (const pad of this.pads) {
			pad.onFrame();
		}
		this.Rom.onFrame();
		this.AnimationFrameRequestId = requestAnimationFrame(() => this._frame());
	}
}