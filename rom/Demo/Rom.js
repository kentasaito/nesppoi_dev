import { System } from '../../System.js';
import { Sprite } from '../../class/graphic/Sprite.js';
import { Background } from '../../class/graphic/Background.js';
import { Text } from '../../class/graphic/Text.js';
import { parameters } from './parameters.js';

// ロム
export class Rom {

	// ロード時
	static async onLoad() {

		// パラメータ
		this.parameters = parameters;

		// 色
		System.setColors((await import('../../asset/colors/nes.js')).colors);

		// パレット
		System.setPalettes((await import('../../asset/palettes/familyBasic.js')).palettes);

		// プレイヤー
		this.players = [];
		for (let i = 0; i < 2; i++) {
			this.players[i] = new Sprite(
				(await import(`./asset/tiles/sprites/player.js`)).tiles,
				System.screen,
				i,
				[this.parameters.onLoadX, 8 * 30 - this.parameters.onLoadX][i],
				this.parameters.onLoadY,
				0,
				[-1, 1][i],
			);
			this.players[i].vx = [this.parameters.onLoadVelocityX, -this.parameters.onLoadVelocityX][i];
			this.players[i].vy = this.parameters.onLoadVelocityY;
		}

		// 背景
		new Background(
			(await import(`./asset/tiles/backgrounds/main.js`)).tiles, 
			(await import(`./asset/pattern/main.js`)).pattern,
			System.screen,
			15,
			0,
			this.parameters.landingLevel + 16,
		);

		// テキスト
		const font = (await import('../../asset/font/misakiGothic2nd.js')).font;
		new Text(font, '"ネスっぽい"へようこそ!', System.screen, 16, 8 * 9, 8 * 7);
		new Text(font, 'Welcome to NESPPOI!', System.screen, 16, 8 * 6, 8 * 9);
		new Text(font, '/rom/Demoをコピーしてオリジナルゲームをつくろう!', System.screen, 16, 8 * 1, 8 * 13);
		new Text(font, 'Copy /rom/Demo and', System.screen, 16, 8 * 7, 8 * 15);
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
				if (System.pads[i].buttons.a) {

					// 上に加速
					this.players[i].vy = this.parameters.initialVelocityY;
				}

				// 左右が押されていたら
				if (System.pads[i].axes.x) {

					// 左右に加速
					this.players[i].vx = System.pads[i].axes.x * this.parameters.initialVelocityX;
				}
			}
			// 浮遊中なら
			else {

				// 下に加速
				this.players[i].vy += this.parameters.gravity;

				// Aボタンが押されていれば
				if (System.pads[i].buttons.a) {

					// 上に加速
					this.players[i].vy += this.parameters.floatingAccelerationY;
				}

				// 左右が押されていて、一定速度以下なら
				if (System.pads[i].axes.x && System.pads[i].axes.x * (this.players[i].vx - this.parameters.floatingMaxVelocityX * System.pads[i].axes.x) < 0) {

					// 左右に加速
					this.players[i].vx += System.pads[i].axes.x * this.parameters.floatingAccelerationX;
				}
			}

			// 左右が押されていれば
			if (System.pads[i].axes.x) {

				// プレイヤーの向きを変える
				this.players[i].scaleX = -System.pads[i].axes.x;
			}
		}
	}
}
