
import { format } from 'prettier';

import {JackPlugin} from 'prettier-plugin-jack';
describe('Formatter', () => {
	test('basic', async () => {
		const input = `class Main{function boolean visible(int x, int y, int w, int h){var int endX,endY,screenW,screenH;let screenH=256;let screenW=512;let endX=x+w;let endY=y+h;return ((x>0)|(x=0))&((endX<screenW)|(endX=screenW))&((y>0)|(y=0))&((endY<screenH)|(endY=screenH));}}`;
		const actual = await format(input, {
			parser: "jack",
			plugins: [JackPlugin],
		});
		expect(actual).toEqual(`
			class ScreenCustom {
				function boolean visible(int x, int y, int w, int h){
					var int endX, endY, screenW, screenH;
					let screenH=256;
					let screenW=512;
					let endX = x+w;
					let endY= y+h;
					return ((x>0) | (x=0)) & ((endX<screenW) | (endX=screenW)) & 
					((y>0) | (y=0)) & ((endY<screenH) | (endY=screenH));
				}
				}
			`);
	});
});