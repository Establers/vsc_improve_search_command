const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');
const readline = require('readline');
const { rgPath } = require('vscode-ripgrep');
const { isCommentLine } = require('../lib/comment-utils');

function createProvider() {
    return {
        provideTextSearchResults(query, options, progress, token) {
            return new Promise((resolve) => {
                const folder = options.folder.fsPath;
                const args = [
                    '--line-number', '--column', '--color', 'never'
                ];
                if (!query.isRegExp) {
                    args.push('-F');
                }
                if (query.isCaseSensitive) {
                    args.push('-s');
                }
                args.push(query.pattern);
                args.push(folder);

                const rg = cp.spawn(rgPath, args, { cwd: folder });
                const rl = readline.createInterface({ input: rg.stdout });

                rl.on('line', (data) => {
                    const parts = data.split(':');
                    if (parts.length < 4) {
                        return;
                    }
                    const file = parts.shift();
                    const lineStr = parts.shift();
                    const colStr = parts.shift();
                    const text = parts.join(':');
                    if (isCommentLine(text)) {
                        return;
                    }
                    const line = parseInt(lineStr, 10) - 1;
                    const col = parseInt(colStr, 10) - 1;
                    const uri = vscode.Uri.file(path.join(folder, file));
                    const range = new vscode.Range(line, col, line, col + query.pattern.length);
                    progress.report({
                        uri,
                        ranges: range,
                        preview: { text, matches: new vscode.Range(0, col, 0, col + query.pattern.length) }
                    });
                });
                rg.on('close', () => resolve({ limitHit: false }));
            });
        }
    };
}

function activate(context) {
    let registration;
    function updateRegistration() {
        const config = vscode.workspace.getConfiguration('commentFilterSearch');
        const enabled = config.get('enabled');
        if (enabled && !registration) {
            registration = vscode.workspace.registerTextSearchProvider('file', createProvider());
        } else if (!enabled && registration) {
            registration.dispose();
            registration = undefined;
        }
    }
    updateRegistration();
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('commentFilterSearch.enabled')) {
            updateRegistration();
        }
    }));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
    isCommentLine
};
