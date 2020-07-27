#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');

// TEMPLATES

const controllerTemplate = `using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace NAMESPACE.Controllers
{
\t[ApiController]
\t[Route("[controller]")]
\tpublic class NAMEController
\t{
\t\tprivate readonly ILogger<NAMEController> _logger;

\t\tpublic DataController(ILogger<NAMEController> logger)
\t\t{
\t\t\t_logger = logger;
\t\t}
\t}
}
`;

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
const controllersDirectory = './Controllers';
const interfacesDirectory = './Interfaces';
const factoriesDirectory = './Factories';
const modelsDirectory = './Models';
const startupFilepath = './Startup.cs';
const templateDirectory = ''
const argv = yargs
    .usage('Usage: dn <command> [options]')
    .command('g', 'generates a set of files')
    .example('dn -g s -n Api -i IApiService', 'generates a service:\n./Interfaces/IApiService.cs\n./Services/ApiService.cs\nupdates Startup.cs')
    .example('dn -g c -n Api', 'generates a controller:\n./Controllers/ApiController.cs')
    .example('dn -g f -n Service', 'generates a factory:\n./Factories/ServiceFactory.cs')
    .example('dn -g m -n Api', 'generates a model:\n./Models/ApiModel.cs')
    .alias('n', 'name')
    .nargs('n', 1)
    .describe('n', 'Name of the generated object')
    .alias('i', 'interface')
    .describe('i', 'Overrides the Interface with this one')
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
    fileText += addObject(fileType, name, interfaceName)
    fileText = addNamespace(fileText, namespace);
    if (importNamespaces != null) {
        console.log(importNamespaces);
        for (const importNamespace in importNamespaces) {
            fileText = `import ${importNamespace};\n` + fileText;
        }
    }
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
    console.log(process.cwd());
    const files = fs.readdirSync(process.cwd());
    return files.filter(f => f.includes('.csproj'))[0].replace('.csproj', '');
}

function generateService(name, overrideInterface = null) {
    createFolder(servicesDirectory);
    createFolder(interfacesDirectory);
    const projectNamespace = getProjectNamespace();
    let interfaceName = `I${name}Service`;
    if (overrideInterface == null) {
        const interfaceContent = createFileContent("interface", `I${name}Service`, `${projectNamespace}.Interfaces`);
        saveFile(`${interfacesDirectory}/I${name}Service.cs`, interfaceContent);
        updateDependencyInjection(name);
    } else {
        interfaceName = overrideInterface;
    }
    const classContent = createFileContent("class", `${name}Service`, `${projectNamespace}.Services`, [`${projectNamespace}.Interfaces`], interfaceName);
    saveFile(`${servicesDirectory}/${name}Service.cs`, classContent);
}

function updateFileData(fileData, namespace, name) {
    let data = fileData.replace(new RegExp('NAMESPACE', 'g'), namespace);
    return data.replace(new RegExp('NAME', 'g'), name);
}

function generateController(name) {
    createFolder(controllersDirectory);
    const fileData = updateFileData((' ' + controllerTemplate).slice(1), getProjectNamespace(), name);
    saveFile(`${controllersDirectory}/${name}Controller.cs`, fileData);
}

function generateFactory(name) {
    createFolder(factoriesDirectory);
    const classContent = createFileContent("static class", `${name}Factory`, +
        `${getProjectNamespace()}.Factories`);
    saveFile(`${factoriesDirectory}/${name}Factory.cs`, classContent);
}

function generateModel(name) {
    createFolder(modelsDirectory);
    const classContent = createFileContent("class", `${name}`, +
        `${getProjectNamespace()}.Models`);
    saveFile(`${modelsDirectory}/${name}.cs`, classContent);
}

switch (argv.g) {
    case 's':
        generateService(argv.name, argv.interface);
        break;
    case 'c':
        generateController(argv.name);
        break;
    case 'f':
        generateFactory(argv.name);
        break;
    case 'm':
        generateModel(argv.name);
        break;
}




