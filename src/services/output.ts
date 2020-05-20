import * as vscode from 'vscode';


let _channel: vscode.OutputChannel | null = null;

export function initOutput(): vscode.Disposable {
    if (!_channel) {
        _channel = vscode.window.createOutputChannel('jq result');
    }

    return {
        dispose: (): any => {
            _channel?.dispose();
            _channel = null;
        }
    };
}

export function newOutput(result: string) {
    _channel?.clear();
    _channel?.append(result);
    _channel?.show(true);
}
