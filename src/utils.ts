import  { window, Terminal } from 'vscode';

export function getTerminalOrNew(name: string): Terminal {
    const terminal = window.terminals.find(e => e.name === name) ?? window.createTerminal(name);
    return terminal;
}