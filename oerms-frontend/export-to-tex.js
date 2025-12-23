// save this as export-to-tex.js in your project root
// run with: node export-to-tex.js

const fs = require("fs");
const path = require("path");

// configure which file types you want to include
const extensions = [".js", ".ts", ".tsx", ".json", ".css"];

const outputFile = "project.tex";

// helper: recursively walk through directories
function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, fileList);
    } else if (extensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// main
function exportProject() {
  const projectRoot = process.cwd();
  const files = walk(projectRoot);

  fs.writeFileSync(outputFile, ""); // clear old file

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    fs.appendFileSync(
      outputFile,
      `%%%% FILE: ${file} %%%%\n${content}\n\n`
    );
  });

  console.log(`✅ Exported ${files.length} files into ${outputFile}`);
}

exportProject();
