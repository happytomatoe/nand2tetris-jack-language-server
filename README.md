# Nand2tetris jack language server

Jack programming language support for Nand2tetris course

![Screenshot from 2024-10-16 21-29-36.png](docs/Screenshot%20from%202024-10-16%2021-29-36.png)

## Features
- [x] Validation
- [x] Basic formatting 
- [x] Subroutine code Completion
- [x] Go to subroutine/class definition


## Development

### Structure

```.
├── client
│   │   ├── extension.ts // Language Client entry point
│   │   └── test // End to End tests for Language Client / Server
├── jack-compiler // Compiler
├── prettier-plugin-jack // prettier  plugin for formatting
├── server // Language Server
├── snippets // Snippets
└── syntaxes // syntaxes folder
```

### Running the language server

- Run `pnpm install` in this folder. This installs all necessary npm modules in all of the necessary subfolders
- Run `pnpm run build` in this folder. This will build all subprojects
- Open VS Code on this folder.
- Press Ctrl+Shift+B to start compiling the client and server in [watch mode](https://code.visualstudio.com/docs/editor/tasks#:~:text=The%20first%20entry%20executes,the%20HelloWorld.js%20file.).
- Switch to the Run and Debug View in the Sidebar (Ctrl+Shift+D).
- Select `Launch Client` from the drop down (if it is not already).
- Press ▷ to run the launch config (F5).
- In the [Extension Development Host](https://code.visualstudio.com/api/get-started/your-first-extension#:~:text=Then%2C%20inside%20the%20editor%2C%20press%20F5.%20This%20will%20compile%20and%20run%20the%20extension%20in%20a%20new%20Extension%20Development%20Host%20window.) instance of VSCode, open jack file.

## Special thanks
Syntax file is vendored from  https://github.com/Throvn/vscode-nand2tetris
Snippets from https://github.com/AvivYaish/nand-ide
