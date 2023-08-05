import { Pad } from './class/Pad.js';
import { Audio } from './class/sound/Audio.js';

export class System {

	// システム開始
	static start() {

		// 時刻
		this.t = 0;

		// スクリーン
		this.screen = document.getElementById('screen');
		document.getElementById('fullscreen').addEventListener('click', () => {
			if (document.fullscreenElement) {
				document.exitFullscreen();
			} else {
				document.getElementById('screenContainer').requestFullscreen();
			}
		});
		window.addEventListener('resize', () => this._onResize());
		this._onResize();

		// ゲームパッド
		if (!localStorage.getItem('pads0_keys0')) {
			localStorage.setItem('pads0_keys0', '[0,-1]');
			localStorage.setItem('pads0_keys1', '[0,1]');
			localStorage.setItem('pads0_keys2', '[1,-1]');
			localStorage.setItem('pads0_keys3', '[1,1]');
			localStorage.setItem('pads0_keys4', '8');
			localStorage.setItem('pads0_keys5', '9');
			localStorage.setItem('pads0_keys6', '0');
			localStorage.setItem('pads0_keys7', '1');
		}
		if (!localStorage.getItem('pads1_keys0')) {
			localStorage.setItem('pads1_keys0', '[0,-1]');
			localStorage.setItem('pads1_keys1', '[0,1]');
			localStorage.setItem('pads1_keys2', '[1,-1]');
			localStorage.setItem('pads1_keys3', '[1,1]');
			localStorage.setItem('pads1_keys4', '8');
			localStorage.setItem('pads1_keys5', '9');
			localStorage.setItem('pads1_keys6', '0');
			localStorage.setItem('pads1_keys7', '1');
		}
		if (!localStorage.getItem('keyboardPads0_keys0')) {
			localStorage.setItem('keyboardPads0_keys0', 'j');
			localStorage.setItem('keyboardPads0_keys1', 'l');
			localStorage.setItem('keyboardPads0_keys2', 'i');
			localStorage.setItem('keyboardPads0_keys3', 'k');
			localStorage.setItem('keyboardPads0_keys4', 'g');
			localStorage.setItem('keyboardPads0_keys5', 'h');
			localStorage.setItem('keyboardPads0_keys6', 'd');
			localStorage.setItem('keyboardPads0_keys7', 'f');
		}
		if (!localStorage.getItem('keyboardPads1_keys0')) {
			localStorage.setItem('keyboardPads1_keys0', 'ArrowLeft');
			localStorage.setItem('keyboardPads1_keys1', 'ArrowRight');
			localStorage.setItem('keyboardPads1_keys2', 'ArrowUp');
			localStorage.setItem('keyboardPads1_keys3', 'ArrowDown');
			localStorage.setItem('keyboardPads1_keys4', 'a');
			localStorage.setItem('keyboardPads1_keys5', 's');
			localStorage.setItem('keyboardPads1_keys6', 'z');
			localStorage.setItem('keyboardPads1_keys7', 'x');
		}
		this.pads = [
			new Pad(0),
			new Pad(1),
		];
		window.addEventListener('gamepadconnected', () => {
			if (this.pads[event.gamepad.index]) {
				this.pads[event.gamepad.index].gamepad = event.gamepad;
			}
		});

		// フレーム停止/再開
		/*
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
		*/

		// オーディオ
		Audio.onStart();

		// デフォルトROMロード
		if (!localStorage.getItem('romName')) {
			localStorage.setItem('romName', 'Demo');
		}
		System.loadRom(localStorage.getItem('romName'));
	}

	// ROMロード
	static async loadRom(romName) {
		const module = await import(`./rom/${romName}/Rom.js`);
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

	// リサイズ時
	static _onResize() {
		const scale = Math.floor(Math.max(1, Math.min(window.innerWidth / 256, window.innerHeight / 240)));
		this.screen.style.transform = `scale(${scale})`;
		this.screen.style.marginLeft = `${(window.innerWidth - 256 * scale) / 2}px`;
	}

	// フレーム
	static _frame() {
		for (let i = 0; i < 2; i++) {
			if (this.pads[i].setupIndex !== undefined) {
				this.pads[i].setup();
			}
		}
		this.Rom.onFrame();
		Audio.onFrame();
		this.t++;
		this.AnimationFrameRequestId = requestAnimationFrame(() => this._frame());
	}
}
