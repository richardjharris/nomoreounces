import { convertOvenTemperatures } from '../../lib/util/convert-oven-temperatures';
import { expect } from 'chai';
import 'mocha';

describe('convertOvenTemperatures function', () => {
    const tests: [string, string][] = [
        ["390'F", "200'C"], // not 199 (rounded)
        ["390 ' F", "200 ' C"],
        ["   390'F  foo", "   200'C  foo"],
        ["gas mark 3", "160°C"],
        ["390 degrees F", "200 degrees C"],
        ["390 degrees Fahrenheit", "200 degrees Celsius"],
        ["preheat oven to 350", "preheat oven to 175°C"], // not 177
        ["preheat oven to 350°", "preheat oven to 175°C"],
        ["set oven to 350'", "set oven to 175°C"],

    ];

    for (const [input, expected] of tests) {
        it(`converts ${input}`, () => {
            expect(convertOvenTemperatures(input)).to.equal(expected);
        });
    }
});
