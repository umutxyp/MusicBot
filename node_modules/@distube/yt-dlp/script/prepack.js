const fs = require("fs");
const path = require("path");
const fromEntries = require("fromentries");

function fn(name) {
  if (name === "postinstall:prod") return "postinstall";
  else if (name === "postinstall") return "postinstall:dev";
  return name;
}

const file = path.join(process.cwd(), "package.json");
let data = fs.readFileSync(file, "utf-8");
const pkg = JSON.parse(data);
pkg.scripts = fromEntries(Object.entries(pkg.scripts).map(([key, value]) => [fn(key), value]));
const regex = /^[ ]+|\t+/m;
const res = regex.exec(data);
const indent = res ? res[0] : null;
data = JSON.stringify(pkg, null, indent);
fs.writeFileSync(file, `${data}\n`);
