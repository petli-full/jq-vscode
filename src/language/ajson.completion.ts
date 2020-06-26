import * as vscode from 'vscode';
import { anyJsonPrefix, anyJsonFormats } from '../services/json';

export const ajsonCompletion = {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
        const completions: vscode.CompletionItem[] = [];

        if (context.triggerKind !== vscode.CompletionTriggerKind.TriggerCharacter) {
            //any-json
            const anyJsonCompletion = new vscode.CompletionItem(anyJsonPrefix.substring(0, anyJsonPrefix.length - 1));
            anyJsonCompletion.commitCharacters = ['.'];
            anyJsonCompletion.kind = vscode.CompletionItemKind.Variable;
            completions.push(anyJsonCompletion);
            return completions;
        }

        // only for any-json
        const range = document.getWordRangeAtPosition(position);
        const word = document.getText(range);
        if (word !== anyJsonPrefix) {
            return completions;
        }

        for (let fmt of anyJsonFormats) {
            const completion = new vscode.CompletionItem(fmt);
            completion.kind = vscode.CompletionItemKind.Method;
            completions.push(completion);
        }

        // return all completion items as array
        return completions;
    }
};
