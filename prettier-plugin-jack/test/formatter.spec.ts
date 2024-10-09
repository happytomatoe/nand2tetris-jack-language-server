import { expect, assert } from "chai";
import fs from "fs";
import path from "path";
import { format } from "prettier";
import { JackPlugin } from "../src/index";
import "./string.utils";

describe("Formatter", () => {
  it("Average", async () => {
    await test("Average");
  });
  it("ComplexArrays", async () => {
    await test("ComplexArrays");
  });
  it("Class vars", async () => {
    await test("class_vars");
  });
  it("comments", async () => {
    await test("comments");
  });
  it("Pong test ", async function () {
    await testDir("Pong");
  });
  it("bugs ", async function () {
    await testDir("bugs");
  });
});
async function testDir(dirName: string) {
  const dirPath = path.join(__dirname, "resources", dirName);
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith(".jack") && file.indexOf("Expected") == -1) {
      const inputFilePath = path.join(dirPath, file);
      const input = fs.readFileSync(inputFilePath, "utf8");
      const expected = fs.readFileSync(
        inputFilePath.substring(0, inputFilePath.indexOf(".jack")) +
          "Expected.jack",
        "utf8",
      );
      const actual = await format(input, {
        parser: "jack",
        plugins: [JackPlugin],
        printWidth: 80,
        tabWidth: 4,
        insertSpaces: true,
      });
      fs.writeFileSync("temp.jack", actual);
      expect(actual).to.equal(expected);
    }
  }
}
async function test(testFolder: string) {
  const inputFilePath = path.join(
    __dirname,
    "resources",
    testFolder,
    "input.jack",
  );
  const expectedFilePath = path.join(
    __dirname,
    "resources",
    testFolder,
    "expected.jack",
  );
  const input = fs.readFileSync(inputFilePath, "utf8");
  const expected = fs.readFileSync(expectedFilePath, "utf8");
  const actual = await format(input, {
    parser: "jack",
    plugins: [JackPlugin],
    printWidth: 80,
    tabWidth: 4,
    insertSpaces: true,
  });
  // console.log(actual);
  expect(actual).to.equal(expected);
  assert.isTrue(actual === expected);
}
