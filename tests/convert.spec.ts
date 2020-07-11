import { convertRecipeText as convert } from '../lib/convert';
import { expect } from 'chai';
import 'mocha';

type TestCase = [string, string, string?];

describe('Basic tests', () => {
    function runTests(tests: Array<TestCase>) {
        for (const test of tests) {
            const [input, search, replace] = test;
            it('test for ' + input, () => {
                let got = convert(input);
                if (replace) {
                    let expected = input.replace(search, replace);
                    expect(got).to.equal(expected);
                }
                else {
                    expect(got).to.equal(search);
                }
            });
        }
    }
    
    // https://www.allrecipes.com/recipe/91499/general-tsaos-chicken-ii/
    describe('General Tsaos', () => {
        const tests: TestCase[] = [
            ['4 cups vegetable oil for frying', '960ml vegetable oil for frying'],
            ['1 egg', '1 egg'],
            // TODO convert cube size also
            ['1 1/2 pounds boneless, skinless chicken thighs, cut into 1/2 inch cubes',
                '680 grams boneless, skinless chicken thighs, cut into 1/2 inch cubes'],
            ['1 teaspoon salt', '1 teaspoon (4g) salt'],
            ['1 teaspoon white sugar', '1 teaspoon (4g) sugar'],
            ['1 pinch white pepper', '1 pinch white pepper'],
            ['1 cup cornstarch', '120g cornstarch'],
            ['2 tablespoons vegetable oil', '2 tablespoons (18 ml) vegetable oil'],
            ['3 tablespoons chopped green onion', '3 tablespoons (11g) chopped green onion'],
            ['1 clove garlic, minced', '1 clove garlic, minced'],
            ['7 dried whole red chilies', '7 dried whole red chilies'],
            ['1 strip orange zest', '1 strip orange zest'],
            ['1/2 cup white sugar', '100g white sugar'],
            //['1/4 teaspoon ground ginger', ''],
            ['3 tablespoons chicken broth', '3 tablespoons (44ml) chicken broth'],
            ['1 tablespoon rice vinegar', '1 tablespoon (15ml) rice vinegar'],
            ['1/4 cup soy sauce', '60ml soy sauce'],
            ['2 teaspoons sesame oil', '2 teaspoons sesame oil'],
            ['2 tablespoons peanut oil', '2 tablespoons (30ml) peanut oil'],
            ['2 teaspoons cornstarch', '2 teaspoons cornstarch'],
            ['1/4 cup water', '60ml water'],
        ];
        runTests(tests);
    });

    describe('converts at string start', () => {
        const tests: TestCase[] = [
            ['15 oz butter', '15 oz', '425g'],
            ['2 cups sugar', '2 cups', '400g'],
            ['1/4 cup sugar', '1/4 cup', '50g'],
            ['20 ounces cream cheese', '20 ounces', '567g'],
            ['18 tbsp unsalted butter, melted', '18 tbsp', '320ml'],
            ['5oz - Unsalted butter (diced)', '5oz', '142g'],
            ['1 cup milk', '1 cup', '240ml'],
            ['1/2 cup dry bread crumbs', '1/2 cup', '63g'],
            ['10 oz - Plain flour', '10 oz', '283g'],
            ['1 stick butter', '1 stick', '113g'],
            ['2 sticks of butter', '2 sticks', '226g'],
            ['1 pouch (6.4 ounces) light tuna in water', '6.4 ounces', '181g'],
        ];
        runTests(tests);
    });
    describe('converts Fahrenheit to Celsius', () => {
        const tests: TestCase[] = [
            ['Preheat oven to 370°.', '370°', '190°C'],
            ['Preheat the oven to 350 degrees F.', '350 degrees F', '175°C'],
        ];
        runTests(tests);
    });
    describe('converts American terms', () => {
        const tests: TestCase[] = [
            ['100g eggplant', 'eggplant', 'aubergine'],
        ];
        runTests(tests);
    });
    xit('handles ranges', () => {
        // Need to test pages with both measurements (below
        // http://www.cookitsimply.com/recipe-0010-01237s6.html
        // Then there is 568 - 900 ml (1 - 1 1/2 pints) fresh milk ... yikes
        expect(convert('1 - 1 1/2 pints fresh milk'))
            .to.equal("568 - 900 ml fresh milk");
    });
});
