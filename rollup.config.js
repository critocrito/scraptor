import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import uglify from "rollup-plugin-uglify";
import pkg from "./package.json";

const input = "lib/index.js";
const plugins = [
  babel({
    presets: [["es2015", {modules: false}]],
    plugins: ["external-helpers"],
    babelrc: false,
    exclude: "node_modules/**",
  }),
];

export default [
  {
    input,
    plugins,
    output: {
      file: pkg.browser,
      format: "iife",
      sourcemap: true,
    },
    name: "scaffold",
  },
  {
    input,
    output: {
      file: `${pkg.browser.split(".")[0]}.min.js`,
      format: "iife",
      sourcemap: true,
    },
    name: "scaffold",
    plugins: plugins.concat([uglify()]),
  },
  {
    input,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
    external: ["lodash/fp"],
    plugins: [resolve(), commonjs()].concat(plugins),
  },
];
