# jq-vscode
This extension allows users run jq queries in the editor. The result is displayed synchronously in the output.

### Jq Version
This extension uses the latest 1.6 version of the [jq](https://stedolan.github.io/jq/) processor.

### Usage
- Filter the currently active json doc by jq in a split editor: (Ctrl+Shift+P) and search "jq: open an ...".

![filter json](https://raw.githubusercontent.com/petli-full/jq-vscode/master/images/filter_json.gif)

- Filter only the selected text.

![filter selected text](https://raw.githubusercontent.com/petli-full/jq-vscode/master/images/filter_selected.gif)

#### Parsing non-standard JSON
In order to be processed by jq, the input json needs to be strictly valid. Nowadays it is common to have comments or other variations in json. In order to convert non-standard json inputs, one of the tools recommended by jq is [any-json](https://github.com/any-json/any-json).

This extension integrates any-json as a utility command. It can be used to preprocess the input json text. Type `ajson` (an abbreviation of "any-json") before jq queries,
```
ajson.<input-file-format> |
<jq queries>
```
![any-json](https://raw.githubusercontent.com/petli-full/jq-vscode/master/images/any_json.gif)