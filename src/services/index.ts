import * as vscode from 'vscode';
import { initJq, jqService } from './jq';
import { initOutput } from './output';


export function initServices(): vscode.Disposable {
    const disposeJq = initJq();
    const disposeOutput = initOutput();

    return {
        dispose: (): void => {
            disposeJq.dispose();
            disposeOutput.dispose();
        }
    };
};

export {
    jqService
};