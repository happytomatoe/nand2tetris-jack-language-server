import { GenericSymbol, SubroutineType } from "./symbol";

export const builtInTypes = ["int", "boolean", "char"];
interface Range {
  min: number;
  max: number;
}
export const intRange = { min: -32768, max: 32767 } as Range;
const builtInFunctionsToArgCount: Record<string, string[]> = {
  "Array.dispose": [],
  "Array.init": [],
  "Array.new": ["size"],
  "Keyboard.init": [],
  "Keyboard.keyPressed": [],
  "Keyboard.readChar": [],
  "Keyboard.readInt": ["message"],
  "Keyboard.readLine": ["message"],
  "Math.abs": ["x"],
  "Math.divide": ["x", "y"],
  "Math.init": [],
  "Math.max": ["x", "y"],
  "Math.min": ["x", "y"],
  "Math.multiply": ["x", "y"],
  "Math.sqrt": ["x"],
  "Memory.alloc": ["size"],
  "Memory.deAlloc": ["o"],
  "Memory.init": [],
  "Memory.peek": ["address"],
  "Memory.poke": ["address", "value"],
  "Output.backSpace": [],
  "Output.init": [],
  "Output.moveCursor": ["i", "j"],
  "Output.printChar": ["c"],
  "Output.printInt": ["i"],
  "Output.println": [],
  "Output.printString": ["s"],
  "Screen.clearScreen": [],
  "Screen.drawCircle": ["x", "y", "r"],
  "Screen.drawLine": ["x1", "y1", "x2", "y2"],
  "Screen.drawPixel": ["x", "y"],
  "Screen.drawRectangle": ["x1", "y1", "x1", "y2"],
  "Screen.init": [],
  "Screen.setColor": ["b"],
  "String.appendChar": ["c"],
  "String.backSpace": [],
  "String.charAt": ["j"],
  "String.dispose": [],
  "String.doubleQuote": [],
  "String.eraseLastChar": [],
  "String.init": [],
  "String.intValue": [],
  "String.length": [],
  "String.new": ["maxLength"],
  "String.newLine": [],
  "String.setCharAt": ["i"],
  "String.setInt": ["j"],
  "Sys.error": ["errorCode"],
  "Sys.halt": [],
  "Sys.wait": ["duration"],
};
const builtInClasses = [
  "Array",
  "Keyboard",
  "Math",
  "Memory",
  "Output",
  "Screen",
  "String",
  "Sys",
];
const builtInClassesRecord = builtInClasses.reduce(
  (acc, elem) => ({
    ...acc,
    [elem]: {} as GenericSymbol,
  }),
  {} as Record<string, GenericSymbol>
);

export const builtInSymbols = Object.keys(builtInFunctionsToArgCount).reduce(
  (acc, elem) => ({
    ...acc,
    [elem]: {
      subroutineInfo: {
        paramNames: builtInFunctionsToArgCount[elem],
        type: SubroutineType.Function,
      },
    } as GenericSymbol,
  }),
  builtInClassesRecord
);
