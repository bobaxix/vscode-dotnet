import * as path from 'path';
import * as fs from 'fs';
import { window } from 'vscode';

import * as utils from './utils';

export async function dotnetPublish(filePath: string) {
    const extension = path.extname(filePath);
    var command;

    if (extension === '.csproj')
        command = publishFromProject(filePath);
    else if (extension === '.pubxml')
        command = publishFromProfile(filePath);
    else if (extension === '.cs')
        command = publishFromContent(filePath);

        await command?.then(x => {
            const terminal = utils.getTerminalOrNew('dotnet')
            
            terminal.show();
            terminal.sendText(x);
        })
}

async function publishFromContent(filePath: string) : Promise<string> {
    const csprojOrSln = lookupForProjectOrSolution(path.dirname(filePath));
    
    if (csprojOrSln === undefined) 
        throw Error("Project or solution not found");

    return publishFromProject(csprojOrSln);
}

async function publishFromProject(projectPath: string): Promise<string> {

    const publishDir = path.join(path.dirname(projectPath), 'Properties', 'PublishProfiles');

    const items = fs.readdirSync(publishDir, { withFileTypes: true })
        .filter(e => path.extname(e.name) === '.pubxml')
        .map(e => path.basename(e.name));

    const profile = await window.showQuickPick(
        items, {
        title: 'Select publish profile',
    });

    if (!profile)
        throw new Error("Not selected");

    return `dotnet publish ${projectPath} /p:PublishProfile=${path.join(publishDir, profile)}`
}

function lookupForProjectOrSolution(xPath: string): string | undefined {

    var parent;
    var child = xPath;
    var result = undefined;

    do {

        parent = child;
        const files = fs.readdirSync(parent);

        result = files.find(x => {
            console.log(x);
            const ext = path.extname(x);
            return ext === ".csproj" || ext === ".sln";
        });

        if (!result)
            child = path.dirname(parent);

    } while (!result && parent !== child);

    return result !== undefined ? path.join(parent ?? child, result) : result;
}

async function publishFromProfile(profilePath: string): Promise<string> {

    var csprojOrSln = lookupForProjectOrSolution(path.dirname(profilePath));
    
    if (csprojOrSln === undefined) 
        throw Error("Project or solution not found");

    return `dotnet publish ${csprojOrSln} /p:PublishProfile=${profilePath}`;
}