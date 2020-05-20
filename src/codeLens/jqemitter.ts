import { CodeLens, TextDocument } from 'vscode';
import { jqService } from '../services';

export function jqemitter(document: TextDocument): CodeLens[] {
    const text = document.getText().trim();
    const doc = document.uri.toString();
    if (document.languageId === 'jqx') {
        jqService.pushjq(doc, text);
    } else {
        jqService.pushjson(doc, text);
    }
    return [];
}
