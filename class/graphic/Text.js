import { Container } from './Container.js';

export class Text extends Container {

	// コンストラクタ
	constructor(font, text, parent, paletteIndex = 0, x = 0, y = 0) {
		super(font, text.split(''), parent, paletteIndex, x, y);
		this.element.style.width = font[text[0]][0].length * text.length + 'px';
		this.element.style.height = font[text[0]].length + 'px';
		for (const [tileIndex, tile] of this.tiles.entries()) {
			tile.style.left = tileIndex * 8 + 'px';
		}
	}
}
