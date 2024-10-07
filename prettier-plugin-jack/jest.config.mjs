/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  roots: ["test"],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  prettierPath:  null
};
