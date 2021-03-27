import { decode } from 'any-json-no-cson';


export const anyJsonPrefix = 'ajson.';
export const anyJsonFormats = [
    'json5',
    'yaml',
    'hjson',
    'ini',
    'toml',
    'xml',
    'csv',
    'xlsx',
    'xls',
    'hocon'
];


export async function decodeJson(jsonText: string, jqText: string): Promise<{ json: string, jq: string }> {
    let _jsonText = jsonText, _jqText = jqText, _anyJson = '';

    for (let fmt of anyJsonFormats) {
        if (_jqText.startsWith(anyJsonPrefix + fmt)) {
            _anyJson = fmt;
            break;
        }
    }

    if (_anyJson) {
        _jqText = _jqText.substr(`${anyJsonPrefix}${_anyJson}`.length).trimLeft();
        if (_jqText.startsWith('|')) {
            _jqText = _jqText.substr(1).trimLeft();
        }
    }

    if (!_jsonText || !_anyJson) {
        return { json: _jsonText, jq: _jqText };
    }

    try {
        const jsonDecoded = await decode(_jsonText, _anyJson);
        const jsonDocs: string[] = [];
        jsonDecoded.forEach((jVal: any) => {
            jsonDocs.push(JSON.stringify(jVal));
        });
        return { json: jsonDocs.join('\n'), jq: _jqText };
    }
    catch (err) {
        return Promise.reject(`input is not a valid ${_anyJson}`);
    }
}
