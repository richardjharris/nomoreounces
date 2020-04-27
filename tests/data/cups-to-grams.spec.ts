import { makeCupLUT, cupToGrams } from '../../lib/data/cup-to-grams';
import { expect, assert } from 'chai';
import 'mocha';

describe('makeCupLUT', () => {
    it('does basic stuff', () => {
        expect(makeCupLUT({
            flour: {
                "*white": 120,
                bread: 136,
            },
        })).to.be.deep.equal({
            flour: {
                white: 120,
                bread: 136,
                '*': 120,
            },
            flours: {
                white: 120,
                bread: 136,
                '*': 120,
            },
        });
    });
    it('does plurals', () => {
        expect(makeCupLUT({
            crisps: 100,
        })).to.be.deep.equal({
            crisps: 100,
            "potato chips": 100,
        })
    });
    it('does American', () => {
        expect(makeCupLUT({
            aubergine: 100
        })).to.be.deep.equal({
            aubergine: 100,
            aubergines: 100,
            eggplant: 100,
            eggplants: 100,
        });
        expect(makeCupLUT({
            sugar: { "*white": 100, "icing": 120 },
        })).to.be.deep.equal({
            sugar: {
                "*": 100,
                white: 100,
                powdered: 120,
                icing: 120,
                confectioners: 120,
                powder: 120,
            },
            sugars: {
                "*": 100,
                white: 100,
                powdered: 120,
                icing: 120,
                confectioners: 120,
                powder: 120,
            },
        })
    });
    it('does commas', () => {
        expect(makeCupLUT({
            "butter, margarine": 100,
        })).to.be.deep.equal({
            butter: 100,
            margarine: 100,
            margarines: 100,
        });
    });
    it('handles nesting', () => {
        expect(makeCupLUT({
            cheese: {
                grated: {
                    "*cheddar": 120,
                },
            },
        })).to.be.deep.equal({
            cheese: {
                grated: {
                    cheddar: 120,
                    '*': 120,
                }
            },
            cheeses: {
                grated: {
                    cheddar: 120,
                    '*': 120,
                }
            }
        });
    });
});

describe('cupsToGrams', () => {
    function runTests(tests: [string, number][]) {
        for(const [input, expected] of tests) {
            assert.equal(cupToGrams(input), expected, `input '${input}'`);
        }
    }

    it('handles basic ingredients', () => {
        runTests([
            ["flour", 120],
            ["salt", 300],
            ["honey", 340],
            ["butter", 225],
            ['pitted date', 225],
        ]);
    });
    it('handles variants of ingredients', () => {
        runTests([
            ["pastry flour", 130],
            ['flour, pastry', 130],
            ['flour (pastry)', 130],
            ['couscous  (uncooked)', 180],
            ['golden syrup', 340],
            ['cornflour', 100],
            ['corn flour', 100],
            ['corn syrup', 340],
            ['golden treacle', 340],
            ['brown sugar', 180],
        ]);
    });
    it('handles word order', () => {
        runTests([
            // Should match cornflour -> masa, not flour
            //['masa cornflour', 114],
            ['masa corn flour', 114],
            // Should match rice flour, not rice
            //['rice flour', 130],
        ]);
    });
    it('handles tricky variants', () => {
        runTests([
            ['shelled peanut', 150],
            // punctuation
            ["confectioners' sugar", 128],
            ["all-purpose flour", 120],
            ["super fine sugar", 225],
            // no variant defined
            ["charred poppy seed", 142],
            ["dry brown breadcrumbs", 150],
            ["fresh whipping cream", 227],
        ]);
    });
    it('handles three words variations', () => {
        runTests([
            ['soft brown sugar', 220],
            ['packed sugar, brown', 220],
            ['grated parmesan cheese', 80],
            ['well sifted all purpose flour', 110],
        ]);
    });
    it('handles plurals', () => {
        runTests([
            ['flaked almonds', 85],
            ['almonds (flaked)', 85],
            ['pecans, halved', 100],
            ['fresh breadcrumbs', 60],
            ['blueberries', 100],
        ])
    });
    it('handles irregular plural', () => {
        runTests([['pearled barlies', 200]]);
    });
    it('handles implicit "whole"', () => {
        runTests([
            ['whole strawberries', 200],
            ['strawberries', 200],
        ])
    });
    it('handles liquids', () => {
        runTests([
            ['butter, melted', 240],
            ['cooking wine', 240],
            ['water', 240],
        ])
    });
});