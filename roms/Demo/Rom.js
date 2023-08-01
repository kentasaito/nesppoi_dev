import { System } from '../../System.js';
import { Sprite } from '../../classes/graphic/Sprite.js';
import { Background } from '../../classes/graphic/Background.js';
import { Text } from '../../classes/graphic/Text.js';

export class Rom {

	static async onLoad() {

		// 色
		System.setColors((await import('../../assets/colors/nes.js')).colors);

		// パレット
		System.setPalettes((await import('../../assets/palettes/familyBasic.js')).palettes);

		// プレイヤー
		this.players = [];
		for (let i = 0; i < 2; i++) {
			this.players[i] = new Sprite((await import(`./assets/tiles/sprites/player.js`)).tiles, System.screen, i, 8 * [0, 30][i], 8 * 6, 0, [-1, 1][i]);
			this.players[i].vx = [16, -16][i];
			this.players[i].vy = -64;
		}

		// 背景
		new Background((await import(`./assets/tiles/backgrounds/main.js`)).tiles, (await import(`./assets/pattern/main.js`)).pattern, System.screen, 15, 8 * 0, 8 * 27);

		// テキスト
		const font = (await import('../../assets/font/misakiGothic2nd.js')).font;
		new Text(font, '"ネスっぽい"へようこそ!', System.screen, 16, 8 * 10, 8 * 7);
		new Text(font, 'Welcome to NESPPOI!', System.screen, 16, 8 * 7, 8 * 9);
		new Text(font, '/roms/Demoをコピーしてオリジナルゲームをつくろう!', System.screen, 16, 8 * 1, 8 * 13);
		new Text(font, 'Copy /roms/Demo and', System.screen, 16, 8 * 6, 8 * 15);
		new Text(font, 'make your own original game!', System.screen, 16, 8 * 2, 8 * 16);
	}

	static onFrame() {
		for (let i = 0; i < 2; i++) {

			// Aボタン
			if (System.pads[i].buttons[0]) {
				if (this.players[i].y === 8 * 25) {
					this.players[i].vy = -72;
				}
			} else {
				if (this.players[i].y < 8 * 25) {
					this.players[i].vy += 4;
				}
			}

			// 右
			if (System.pads[i].buttons[7]) {
				if (this.players[i].y === 8 * 25) {
					if (this.players[i].vx < 32) {
						this.players[i].vx = 32;
					}
				} else {
					if (this.players[i].vx < 12) {
						this.players[i].vx += 2;
					}
				}
				this.players[i].scaleX = -1;
			}

			// 左
			if (System.pads[i].buttons[6]) {
				if (this.players[i].y === 8 * 25) {
					if (this.players[i].vx > -32) {
						this.players[i].vx = -32;
					}
				} else {
					if (this.players[i].vx > -12) {
						this.players[i].vx -= 2;
					}
				}
				this.players[i].scaleX = 1;
			}

			// 停止中
			if (this.players[i].vx === 0) {
				this.players[i].tileKey = 0;
			}

			// 位置更新
			this.players[i].x += Math.trunc(this.players[i].vx / 8);
			this.players[i].y += Math.trunc(this.players[i].vy / 8);

			// 着地中
			if (this.players[i].y === 8 * 25) {
				this.players[i].vx -= Math.sign(this.players[i].vx);
			}

			// 地面めり込み
			if (this.players[i].y >= 8 * 25) {
				this.players[i].vy = 0;
				this.players[i].y = 8 * 25;
			} else {
				this.players[i].vy += 2;
			}
		}
	}
}
