const jqdash = require('jqdash');
const fs = require('fs');

const jqTaggers = require('../src/language/formatters.json');

const templateFile = './syntaxes/jqx.tmLanguage.tmpl';
const jsonFile = './syntaxes/jqx.tmLanguage.json';
jqdash.default().then((result) => {
    const jq = result.jq;
    const jqresult = jq('null', 'builtins | map(split("/")[0]) | unique', ['-M']).stdout;
    const funcs = JSON.parse(jqresult);
    fs.readFile(templateFile, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        try {
            fs.unlinkSync(jsonFile);
        } catch (err) { }


        // jq functions
        let generated = data.toString().replace('{{functions}}', funcs.join('|'));

        // jq taggers
        const jqTaggerKws = jqTaggers.map(val => val.label);
        generated = generated.replace('{{jq-taggers}}', jqTaggerKws.join('|'));

        // any-json
        const anyJsonKws = ['ajson', 'json5', 'yaml', 'hjson', 'ini', 'toml', 'xml', 'csv', 'xlsx', 'xls'];
        generated = generated.replace('{{any-json}}', anyJsonKws.join('|'));

        fs.writeFile(jsonFile, generated, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Generated file: ./syntaxes/jqx.tmLanguage.json');
            }
        });
    });
});
