import { System } from '../../System.js';
import { Sprite } from '../../classes/graphic/Sprite.js';
import { Background } from '../../classes/graphic/Background.js';
import { Text } from '../../classes/graphic/Text.js';
import { parameters } from './parameters.js';

// ロム
export class Rom {

	// 開始時
	static async onLoad() {

		// パラメータ
		this.parameters = parameters;

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
		new Background(
			(await import(`./assets/tiles/backgrounds/main.js`)).tiles, 
			(await import(`./assets/pattern/main.js`)).pattern,
			System.screen,
			15,
			0,
			this.parameters.landingLevel + 16
		);

		// テキスト
		const font = (await import('../../assets/font/misakiGothic2nd.js')).font;
		new Text(font, '"ネスっぽい"へようこそ!', System.screen, 16, 8 * 10, 8 * 7);
		new Text(font, 'Welcome to NESPPOI!', System.screen, 16, 8 * 7, 8 * 9);
		new Text(font, '/roms/Demoをコピーしてオリジナルゲームをつくろう!', System.screen, 16, 8 * 1, 8 * 13);
		new Text(font, 'Copy /roms/Demo and', System.screen, 16, 8 * 6, 8 * 15);
		new Text(font, 'make your own original game!', System.screen, 16, 8 * 2, 8 * 16);
	}

	// フレーム時
	static onFrame() {

		// 両プレイヤーについて
		for (let i = 0; i < 2; i++) {

			// 位置更新
			this.players[i].x += Math.trunc(this.players[i].vx / 8);
			this.players[i].y += Math.trunc(this.players[i].vy / 8);

			// 着地中なら
			if (this.players[i].y >= this.parameters.landingLevel) {

				// X軸の速度は減速
				this.players[i].vx += Math.sign(-this.players[i].vx) * this.parameters.friction;

				// Y軸の速度は0
				this.players[i].vy = 0;

				// 地面にはめり込まない
				this.players[i].y = this.parameters.landingLevel;

				// Aボタンが押されていれば
				if (System.pads[i].buttons[0]) {

					// 上に加速
					this.players[i].vy = this.parameters.initialVelocityY;
				}

				// 右が押されていたら
				if (System.pads[i].buttons[7]) {

					// 右に加速
					this.players[i].vx = this.parameters.initialVelocityX;
				}

				// 左が押されていたら
				if (System.pads[i].buttons[6]) {

					// 右に加速
					this.players[i].vx = -this.parameters.initialVelocityX;
				}
			}
			// 着地していなければ
			else {

				// 下に加速
				this.players[i].vy += this.parameters.gravity;

				// Aボタンが押されていれば
				if (System.pads[i].buttons[0]) {

					// 上に加速
					this.players[i].vy += this.parameters.floatingAccelerationY;
				}

				// 右が押されていて、一定速度以下なら
				if (System.pads[i].buttons[7] && this.players[i].vx < this.parameters.floatingMaxVelocityX) {

					// 右に加速
					this.players[i].vx += this.parameters.floatingAccelerationX;
				}

				// 左が押されていて、一定速度以下なら
				if (System.pads[i].buttons[6] && this.players[i].vx > -this.parameters.floatingMaxVelocityX) {

					// 左に加速
					this.players[i].vx += -this.parameters.floatingAccelerationX;
				}
			}

			// 右が押されていれば
			if (System.pads[i].buttons[7]) {
				this.players[i].scaleX = -1;
			}

			// 左が押されていれば
			if (System.pads[i].buttons[6]) {
				this.players[i].scaleX = 1;
			}
		}
	}
}
