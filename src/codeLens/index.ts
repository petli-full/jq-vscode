import { CodeLensProvider, CodeLens, TextDocument, CancellationToken } from 'vscode';
import { jqemitter } from './jqemitter';


export class RootCodeLensProvider implements CodeLensProvider {
    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Promise<CodeLens[]> {
        let codeLenses: CodeLens[] = [];
        // emit jq text
        codeLenses = codeLenses.concat(jqemitter(document));

        return codeLenses;
    }

    public resolveCodeLens?(codeLens: CodeLens, token: CancellationToken): CodeLens | Promise<CodeLens> {
        return codeLens;
    }
}
