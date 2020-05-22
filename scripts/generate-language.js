const jqdash = require('jqdash');
const fs = require('fs');

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

        fs.unlinkSync(jsonFile);

        const generated = data.toString().replace('{{functions}}', funcs.join('|'));
        fs.writeFile(jsonFile, generated, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Generated file: ./syntaxes/jqx.tmLanguage.json');
            }
        });
    });
});
