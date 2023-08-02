export class Container {

	// コンストラクタ
	constructor(tiles, tileKeys, parent, paletteIndex = 0, x = 0, y = 0) {
		this.element = document.createElement('div');
		this.element.style.position = 'absolute';

		this.tiles = [];
		for (const [tileIndex, tileKey] of tileKeys.entries()) {
			const tile = tiles[tileKey];
			this.tiles[tileIndex] = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			this.tiles[tileIndex].style.position = 'absolute';
			this.tiles[tileIndex].style.width = tile[0].length + 'px';
			this.tiles[tileIndex].style.height = tile.length + 'px';
			for (const [y, line] of tile.entries()) {
				for (const [x, v] of line.entries()) {
					if (v) {
						const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
						rect.setAttribute('width', 1);
						rect.setAttribute('height', 1);
						rect.setAttribute('x', x);
						rect.setAttribute('y', y);
						rect.dataset.fill = v;
						this.tiles[tileIndex].append(rect);
					}
				}
			}
			this.element.append(this.tiles[tileIndex]);
		}

		Object.defineProperty(this, 'paletteIndex', {
			get: () => this._paletteIndex,
			set: value => {
				this._paletteIndex = Math.trunc(value);
				this.element.dataset.paletteIndex = this._paletteIndex;
			},
		});
		Object.defineProperty(this, 'x', {
			get: () => this._x,
			set: value => {
				this._x = Math.trunc(value);
				this.element.style.left = this._x + 'px';
			},
		});
		Object.defineProperty(this, 'y', {
			get: () => this._y,
			set: value => {
				this._y = Math.trunc(value);
				this.element.style.top = this._y + 'px';
			},
		});

		this.paletteIndex = paletteIndex;
		this.x = x;
		this.y = y;

		parent.append(this.element);
	}
}
