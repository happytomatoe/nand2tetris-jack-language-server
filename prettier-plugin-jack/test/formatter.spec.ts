
import { expect } from 'chai';
import fs from 'fs';
import { format, doc } from 'prettier';
import './string.utils';
import { JackPlugin } from '../src/index';
import path from 'path';
describe('Formatter', () => {
  it('Average', async () => {
    await test('Average')
  });
  it('ComplexArrays', async () => {
    await test('ComplexArrays')
  });
  it('Class vars', async () => {
    await test('class_vars')
  });
});
async function test(testFolder: string) {
  const inputFilePath = path.join(__dirname, "resources", testFolder, 'input.jack');
  const expectedFilePath = path.join(__dirname, "resources", testFolder, 'expected.jack');
  const expectedFile = path.join(__dirname, "resources", testFolder);
  const input = fs.readFileSync(inputFilePath, 'utf8');
  const expected = fs.readFileSync(expectedFilePath, 'utf8');
  const actual = await format(input, {
    parser: "jack",
    plugins: [JackPlugin],
    "printWidth": 80,
    "tabWidth": 4,
    // "requireConfig": false,
    // "useTabs": false,
    // "trailingComma": "none",
    // "bracketSpacing": true,
    // "jsxBracketSameLine": false,
    // "semi": true
    insertSpaces: true,
  });
  console.log(actual);
  expect(actual).to.equal(expected);
}
