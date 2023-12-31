import { System } from '../../System.js';
import { Sprite } from '../../class/graphic/Sprite.js';
import { Background } from '../../class/graphic/Background.js';
import { Text } from '../../class/graphic/Text.js';
import { Sound } from '../../class/sound/Sound.js';
import { parameters } from './parameters.js';

// ロム
export class Rom {

	// ロード時
	static async onLoad() {

		// パラメータ
		this.parameters = parameters;

		// 色
		System.setColors((await import('../../asset/colors/nesppoi.js')).colors);

		// パレット
		System.setPalettes((await import('../../asset/palettes/nesppoi.js')).palettes);

		// 背景
		new Background(
			(await import(`./asset/tiles/backgrounds/main.js`)).tiles, 
			(await import(`./asset/pattern/main.js`)).pattern,
			System.screen,
			0,
			0,
			this.parameters.landingLevel + 16,
		);

		// テキスト
		const fonts = [
			(await import('../../asset/font/misaki_gothic_2nd.js')).font,
			(await import('../../asset/font/ModernDOS8x8.js')).font,
		];
		new Text(fonts[0], '"ネスっぽい"へようこそ!', System.screen, 0, 8 * 9, 8 * 7);
		new Text(fonts[1], 'Welcome to NESPPOI!', System.screen, 0, 8 * 6, 8 * 9);
		new Text(fonts[0], '/rom/Demoをコピーしてオリジナルゲームをつくろう!', System.screen, 0, 8 * 1, 8 * 13);
		new Text(fonts[1], 'Copy /rom/Demo and', System.screen, 0, 8 * 7, 8 * 15);
		new Text(fonts[1], 'make your own original game!', System.screen, 0, 8 * 2, 8 * 16);

		// プレイヤー
		this.players = [];
		for (let i = 0; i < 2; i++) {
			this.players[i] = new Sprite(
				(await import(`./asset/tiles/sprites/player.js`)).tiles,
				System.screen,
				i + 1,
				[this.parameters.onLoadX, 8 * 30 - this.parameters.onLoadX][i],
				this.parameters.onLoadY,
				0,
				[1, -1][i],
			);
			this.players[i].vx = [this.parameters.onLoadVelocityX, -this.parameters.onLoadVelocityX][i];
			this.players[i].vy = this.parameters.onLoadVelocityY;
		}

		// 効果音
		for (const name of ['Jump']) {
			Sound.addEffect(name, (await import(`./asset/waves/effects/${name}.js`)).waves());
		}
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

					// 効果音を開始
					Sound.startEffect('Jump');

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

				// 押されていなければ
				else {
					// 効果音を開始
					Sound.stopEffect();
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
				this.players[i].scaleX = System.pads[i].axes.x;
			}
		}
	}
}
