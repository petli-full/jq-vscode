import * as vscode from 'vscode';


export function openjq() {
    vscode.workspace.openTextDocument({ language: 'jqx', content: '' }).then(doc => {
        vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside).then(editor => {
            // opened
        });

    });
}
