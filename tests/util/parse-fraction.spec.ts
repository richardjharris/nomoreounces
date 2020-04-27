import { parseFraction } from '../../lib/util/parse-fraction';
import { expect } from 'chai';
import 'mocha';

describe('parseFraction function', () => {

    // (input, expected_output, test_name)
    const tests: [string, string, string?][] = [
        ['', '', 'empty string'],
        ['foobar', 'foobar', 'non-number'],
        ['1/2', '0.5'],
        ['a 1/2 cup', 'a 0.5 cup', 'inplace conversion'],
        ['1 / 2 cups', '0.5 cups', 'spacing'],
        ['3 3/4', '3.75'],
        ['3 3 / 4', '3.75', 'spacing'],
        ['1', '1'],
        ['1.5', '1.5', 'decimal'],
        ['1½', '1.5', 'plain unicode'],
        ['1&frac12;', '1.5', 'named entity'],
        ['1&#189;', '1.5', 'decimal entity'],
        ['1&#xBD;', '1.5', 'hexadecimal entity'],
        ['2&frac14;', '2.25'],
        ['2 &frac34;', '2.75', 'entity spacing'],
        ['³⁄₄', '0.75', 'unicode slash, super-/sub-script'],
        ['3⁄4', '0.75', 'plain unicode slash'],
        ['1 - 1 1/2 cups', '1 - 1.5 cups', 'multiple'],
        ['1/4 sugar (1/2 kept aside)', '0.25 sugar (0.5 kept aside)'],
    ];

    tests.forEach(([input, expected, comment]) => {
        it(`should map '${input}' to '${expected}'`, () => {
            const got = parseFraction(input);
            expect(got).to.equal(expected, comment);
        });
    })
});
