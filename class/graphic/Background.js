import { Container } from './Container.js';

export class Background extends Container {

	// コンストラクタ
	constructor(tiles, pattern, parent, paletteIndex = 0, x = 0, y = 0) {
		super(tiles, pattern.reduce((pre, current) => {pre.push(...current); return pre}, []), parent, paletteIndex, x, y);

		this.element.style.width = tiles[0].length * pattern[0].length + 'px';
		this.element.style.height = tiles.length * pattern.length + 'px';


		for (const [tileIndex, tile] of this.tiles.entries()) {
			tile.style.left = tiles[0][0].length * (tileIndex % pattern[0].length) + 'px';
			tile.style.top = tiles[0][0].length * Math.floor(tileIndex / pattern[0].length) + 'px';
		}
	}
}
