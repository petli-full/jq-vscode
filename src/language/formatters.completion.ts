import * as vscode from 'vscode';
import * as formatters from './formatters.json';

export const formatterCompletion = {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
        const completions: vscode.CompletionItem[] = [];
        if (context.triggerKind !== vscode.CompletionTriggerKind.TriggerCharacter) {
            return completions;
        }

        //formatters
        for (let formatter of formatters) {
            const completion = new vscode.CompletionItem(formatter.label);
            completion.kind = vscode.CompletionItemKind.Function;
            completion.documentation = new vscode.MarkdownString(formatter.documentation);
            completions.push(completion);
        }

        // return all completion items as array
        return completions;
    }
};