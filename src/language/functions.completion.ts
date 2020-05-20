import * as vscode from 'vscode';
import { jq } from 'jqdash';

export const functionsCompletion = jq('null', 'builtins | sort | map(split("/") | [.[0], (.[1] | tonumber)])', ['-M']).then((result) => {
    const funcs: any[][] = JSON.parse(result);
    const functionsCompletion = {

        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            const completions = funcs.map((f: any) => {
                const completion = new vscode.CompletionItem(f[0]);
                completion.kind = vscode.CompletionItemKind.Function;
                let insertText = f[0];
                let mark = `functiton ${f[0]}`;
                if (f[1] > 0) {
                    const params = [];
                    for (let i = 1; i <= f[1]; i++) {
                        params.push(`\$${i}`);
                    }
                    insertText = `${f[0]}(${params.join(', ')})`;
                    mark = `function ${f[0]}(${params.join(', ')})`;
                }
                completion.insertText = new vscode.SnippetString(insertText);
                completion.documentation = new vscode.MarkdownString(mark);

                return completion;
            });

            // return all completion items as array
            return completions;
        }
    };

    return functionsCompletion;
});
