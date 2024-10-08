
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { format } from 'prettier';
import { JackPlugin } from '../src/index';
import './string.utils';
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
  it('comments', async () => {
    await test('comments')
  });
});
async function test(testFolder: string) {
  const inputFilePath = path.join(__dirname, "resources", testFolder, 'input.jack');
  const expectedFilePath = path.join(__dirname, "resources", testFolder, 'expected.jack');
  const input = fs.readFileSync(inputFilePath, 'utf8');
  const expected = fs.readFileSync(expectedFilePath, 'utf8');
  const actual = await format(input, {
    parser: "jack",
    plugins: [JackPlugin],
    "printWidth": 80,
    "tabWidth": 4,
    insertSpaces: true,
  });
  console.log(actual);
  expect(actual).to.equal(expected);
}
