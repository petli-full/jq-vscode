import * as vscode from 'vscode';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import jqdash from 'jqdash';
import { newOutput } from './output';
import { decodeJson } from './json';

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

    const selectionEvt = vscode.window.onDidChangeTextEditorSelection((selectChangeEvt) => {
        const doc = vscode.window.activeTextEditor?.document;
        if (doc && doc.languageId !== 'jqx' && doc.languageId !== 'Log') {
            const sel = vscode.window.activeTextEditor?.selection;
            const docPath = doc.uri.toString();
            if (!sel || sel.isEmpty) {
                jqService.pushjson(docPath, doc.getText().trim());
            } else {
                jqService.pushjson(docPath, doc.getText(sel).trim());
            }
        }
    });

    return {
        dispose: (): any => {
            jqsub.unsubscribe();
            jsonsub.unsubscribe();
            docEvt.dispose();
            selectionEvt.dispose();
        }
    };
}

let _jqdash = jqdash();

function execjq() {
    if (!_hasJq) {
        return;
    }

    const opts = ['-M'];
    if (!_json) {
        opts.push('-n');
    }

    decodeJson(_json, _jq).then(async (request: { json: string, jq: string }) => {
        const jqmodule: any = await _jqdash;
        const { jq } = jqmodule;
        return Promise.resolve({ jqFunc: jq, ...request });
    }).then(async (jqJob: { jqFunc: Function, json: string, jq: string }) => {
        try {
            const jqInput = parseJqOptions(jqJob.jq);
            const result = jqJob.jqFunc(jqJob.json, jqInput.jq, opts.concat(jqInput.options));
            if (result.stderr && result.stderr.includes('parse error: Invalid numeric literal')) {
                _jqdash = jqdash();
            }
            newOutput(result.stdout || result.stderr);
        } catch (err) {
            _jqdash = jqdash();
            newOutput('runtime error');
        }
    }).catch((err) => {
        newOutput(err);
    });
}

function parseJqOptions(jqText: string): { options: string[], jq: string } {
    const allOpts = [
        '--version',
        '--seq',
        '--stream',
        '--slurp',
        '-s',
        '--raw-input',
        '-R',
        '--null-input',
        '-n',
        '--compact-output',
        '-c',
        '--tab',
        '--ascii-output',
        '-a',
        '--sort-keys',
        '-S',
        '--raw-output',
        '-r',
        '--join-output',
        '-j',
        '--nul-output',
        '-0',
    ];
    const result = [];
    let _jqText = jqText;
    while (_jqText.startsWith('-')) {
        let validOpt = false;

        if (_jqText.startsWith('--indent ')) {
            validOpt = true;
            _jqText = _jqText.substr('--indent'.length).trimLeft();
            if (_jqText.length > 0 && _jqText[0] >= '0' && _jqText[0] <= '7') {
                result.push('--indent');
                result.push(_jqText[0]);
                _jqText = _jqText.substr(1).trimLeft();
            }
        }
        if (_jqText.startsWith('--arg ')) {
            validOpt = true;
            _jqText = _jqText.substr('--arg'.length).trimLeft();
            let wsIndex = _jqText.indexOf(' ');
            if (wsIndex > 0) {
                const name = _jqText.substr(0, wsIndex);
                _jqText = _jqText.substr(name.length).trimLeft();
                wsIndex = _jqText.indexOf(' ');
                if (wsIndex > 0) {
                    const value = _jqText.substr(0, wsIndex);
                    _jqText = _jqText.substr(value.length).trimLeft();
                    result.push('--arg');
                    result.push(name);
                    result.push(value);
                }
            }
        }
        if (_jqText.startsWith('--argjson ')) {
            validOpt = true;
            _jqText = _jqText.substr('--argjson'.length).trimLeft();
            let wsIndex = _jqText.indexOf(' ');
            if (wsIndex > 0) {
                const name = _jqText.substr(0, wsIndex);
                _jqText = _jqText.substr(name.length).trimLeft();
                wsIndex = _jqText.indexOf(' ');
                if (wsIndex > 0) {
                    const value = _jqText.substr(0, wsIndex);
                    _jqText = _jqText.substr(value.length).trimLeft();
                    result.push('--argjson');
                    result.push(name);
                    result.push(value);
                }
            }
        }

        for (const opt of allOpts) {
            if (_jqText.startsWith(opt + ' ')) {
                result.push(opt);
                validOpt = true;
                _jqText = _jqText.substr(opt.length).trimLeft();
                break;
            }
        }

        if (!validOpt) {
            break;
        }
    }

    return { options: result, jq: _jqText };
}