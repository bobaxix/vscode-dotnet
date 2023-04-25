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

        await command?.then(x => {
            const terminal = utils.getTerminalOrNew('dotnet')
            
            terminal.show();
            terminal.sendText(x);
        })
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

async function publishFromProfile(profilePath: string): Promise<string> {

    var result = path.dirname(profilePath);
    var csprojOrSln = undefined;
    var parent = undefined;

    do {
        parent = path.dirname(result);

        if (parent === result)
            throw new Error("Project not found");

        result = parent;

        const files = fs.readdirSync(result);

        csprojOrSln = files.find(x => {
            console.log(x);
            const ext = path.extname(x);
            return ext === ".csproj" || ext === ".sln";
        });

    } while (!csprojOrSln);

    return `dotnet publish ${path.join(parent, csprojOrSln)} /p:PublishProfile=${profilePath}`;
}