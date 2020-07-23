#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');

Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

const addObject = (type, name, interfaceName = null) => {
    let resultText = `public ${type} ${name}`
    if (interfaceName) {
        resultText += ` : ${interfaceName}`
    }
    resultText += '\n\t{\n\t\n\t}';
    return resultText;
}

const addNamespace = (str, namespace) => {
    str = `namespace ${namespace}\n{\n\t` + str;
    str = str + "\n}";
    return str;
}

const servicesDirectory = './Services';
const interfacesDirectory = './Interfaces';
const startupFilepath = './Startup.cs';
const argv = yargs
    .usage('Usage: dn <command> [options]')
    .command('g', 'generates a set of files')
    .example('dn -g s -n Api', 'generates a service:\n./Interfaces/IApiService\n./Services/ApiService\nupdates Startup.cs')
    .example('dn -g c -n Api', 'generates a controller:\n./Controllers/ApiController')
    .alias('n', 'name')
    .nargs('n', 1)
    .describe('n', 'Name of the generated object')
    .demandOption(['n'])
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2020')
    .argv;

function createFolder(folderpath) {
    if (!fs.existsSync(folderpath)) {
        fs.mkdirSync(folderpath);
        console.log(`created folder ${folderpath}`);
    }
}

function createFileContent(fileType, name, namespace, importNamespaces = null, interfaceName = null) {
    let fileText = '';
    if (importNamespaces) {
        for (const importNamespace in importNamespaces) {
            fileText = `import ${importNamespace};\n` + fileText;
        }
    }
    fileText = addObject(fileType, name, interfaceName)
    fileText = addNamespace(fileText, namespace);
    return fileText;
}

function saveFile(filepath, content) {
    if (fs.existsSync(filepath)) {
        return;
    }
    fs.writeFileSync(filepath, content);
}

function updateDependencyInjection(name) {
    let fileContent = fs.readFileSync(startupFilepath, "utf8");
    if (fileContent) {
        const stringToReplace = 'services.AddControllers();';
        const lines = fileContent.split('\r\n');
        const insertIndex = lines.indexOf(lines.filter(l => l.includes(stringToReplace))[0]);
        lines.splice(insertIndex + 1, 0, `\t\t\tservices.AddScoped<I${name}Service, ${name}Service>();`);
        fs.writeFileSync(startupFilepath, lines.join("\r\n"));
    } else {
        console.log('Cannot find Startup.cs file');
    }
}

function getProjectNamespace() {
    const files = fs.readdirSync(process.cwd());
    return files.filter(f => f.includes('.csproj'))[0].replace('.csproj', '');
}

function generateService(name) {
    createFolder(servicesDirectory);
    createFolder(interfacesDirectory);
    const projectNamespace = getProjectNamespace();
    const interfaceContent = createFileContent("interface", `I${name}Service`, `${projectNamespace}.Interfaces`);
    const classContent = createFileContent("class", `${name}Service`, `${projectNamespace}.Services`, 'Interfaces', `I${name}Service`);
    saveFile(`${interfacesDirectory}/I${name}Service.cs`, interfaceContent);
    saveFile(`${servicesDirectory}/${name}Service.cs`, classContent);
    updateDependencyInjection(name);
}

function generateController(name) {

}

switch (argv.g) {
    case 's':
        generateService(argv.n);
        break;
    case 'c':
        generateController(argv.n);
        break;
}




