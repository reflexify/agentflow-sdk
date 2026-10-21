"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function strict(obj) {
  return new Proxy(obj, {
    get(target, key) {
      if (typeof key === "symbol" || key in target) return target[key];
      throw new Error(`undeclared input '${String(key)}'`);
    },
  });
}

function load(name) {
  const source = fs.readFileSync(path.join(__dirname, "..", name), "utf8");
  const context = vm.createContext({});
  vm.runInContext(source, context, { filename: name });
  const main = vm.runInContext("typeof main === 'function' ? main : undefined", context);
  if (typeof main !== "function") throw new Error(`${name} defines no main`);
  // The wrapper sends main's result through JSON, so a test sees what a run
  // would: plain data from this realm, not objects of the sandbox's.
  return (inputs) => JSON.parse(JSON.stringify(main(strict(inputs), strict({}))));
}

module.exports = { load };
