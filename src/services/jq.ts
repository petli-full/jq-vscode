import * as vscode from 'vscode';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { jq } from 'jqdash';
import { newOutput } from './output';

const jq$ = new Subject<string>();
let _jq: string = '';
let _jqdoc: string = '';
const json$ = new Subject<string>();
let _json: string = '';
let _jsondoc: string = '';
let _hasJq: boolean = false;

export const jqService: {
    pushjq: (doc: string, jqtext: string) => void,
    pushjson: (doc: string, jsontext: string) => void
} = {
    pushjq: (doc: string, jqtext: string): void => {
        jq$.next(jqtext);
        _jqdoc = doc;
    },
    pushjson: (doc: string, jsontext: string): void => {
        json$.next(jsontext);
        _jsondoc = doc;
    },
};

export function initJq(): vscode.Disposable {
    const jqsub = jq$.pipe(
        debounceTime(750),
        distinctUntilChanged(),
    ).subscribe((text) => {
        _jq = text.split("\n").join(' ').trim();
        if (_jq) { _hasJq = true; }
        execjq();
    });

    const jsonsub = json$.pipe(
        debounceTime(750),
        distinctUntilChanged(),
    ).subscribe((text) => {
        _json = text.trim();
        execjq();
    });

    const docEvt = vscode.window.onDidChangeActiveTextEditor((doc) => {
        let foundJqdoc = false;
        let foundJsondoc = false;
        _hasJq = false;
        vscode.window.visibleTextEditors.forEach(visibleEditor => {
            if (visibleEditor.document.uri.toString() === _jqdoc) {
                foundJqdoc = true;
            }
            if (visibleEditor.document.uri.toString() === _jsondoc) {
                foundJsondoc = true;
            }
            if (visibleEditor.document.languageId === 'jqx') {
                _hasJq = true;
            }
        });
        if (!foundJqdoc) {
            jqService.pushjq('', '');
        }
        if (!foundJsondoc) {
            jqService.pushjson('', '');
        }
    });

    return {
        dispose: (): any => {
            jqsub.unsubscribe();
            jsonsub.unsubscribe();
            docEvt.dispose();
        }
    };
}

function execjq() {
    if (!_hasJq) {
        return;
    }

    const opts = ['-M'];
    if (!_json) {
        opts.push('-n');
    }
    jq(_json, _jq, opts).then((result) => {
        newOutput(result);
    }, (err) => {
        newOutput("no result");
    });
}
