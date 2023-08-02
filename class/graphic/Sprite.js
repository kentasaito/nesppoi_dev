import { Container } from './Container.js';

export class Sprite extends Container {

	// コンストラクタ
	constructor(tiles, parent, paletteIndex = 0, x = 0, y = 0, rotate = 0, scaleX = 1, scaleY = 1, tileIndex = 0) {
		super(tiles, Object.keys(tiles), parent, paletteIndex, x, y);

		this.element.style.width = tiles[0][0].length + 'px';
		this.element.style.height = tiles[0].length + 'px';

		Object.defineProperty(this, 'rotate', {
			get: () => this._rotate,
			set: value => {
				this._rotate = Math.trunc(value / 90) * 90;
				this.element.style.transform = `rotate(${this._rotate || 0}deg) scale(${this._scaleX || 1}, ${this._scaleY || 1})`;
			},
		});
		Object.defineProperty(this, 'scaleX', {
			get: () => this._scaleX,
			set: value => {
				this._scaleX = Math.sign(value);
				this.element.style.transform = `rotate(${this._rotate || 0}deg) scale(${this._scaleX || 1}, ${this._scaleY || 1})`;
			},
		});
		Object.defineProperty(this, 'scaleY', {
			get: () => this._scaleY,
			set: value => {
				this._scaleY = Math.sign(value);
				this.element.style.transform = `rotate(${this._rotate || 0}deg) scale(${this._scaleX || 1}, ${this._scaleY || 1})`;
			},
		});
		Object.defineProperty(this, 'tileIndex', {
			get: () => this._tileIndex,
			set: value => {
				this._tileIndex = (this.tiles.length + value) % this.tiles.length;
				for (const scene of this.tiles) {
					scene.style.visibility = 'hidden';
				}
				this.tiles[this._tileIndex].style.visibility = 'visible';
			},
		});

		this.rotate = rotate;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
		this.tileIndex = tileIndex;
	}
}
