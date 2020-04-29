import _ from 'lodash';
import pluralize from 'pluralize';
import { britishToAmerican } from './american-terms';
import * as regexp from '../util/regexp';

// ml per cup for liquids
const LIQUID = 240;

type CupDataEntry =
    | number
    | string
    | {
          [modifier: string]: CupDataEntry;
      };
type CupData = {
    [ingredient: string]: CupDataEntry;
};

// This is the raw data for the cup conversions. It will be turned
// into something more machine friendly.
// CSV for multiples
// Everything in singular
// Star first means this is the default option if no modifier
// Use UK terms (US conversion will occur first)
const cupConversions: CupData = {
    // The most critical one. 120 is the measurement after lightly spooning the
    // flour into the cup (without packing it, or shaking the cup) then levelling
    // it with a knife. Other meaurements can be as high as 150-160g.
    'flour': {
        '*white': 120,
        'plain': 120,
        'sieved': 110,
        'allpurpose, ap, all purpose': {
            '*': 120,
            'well sifted, wellsifted': 110,
        },
        'wheat': 140,
        'bread': 136,
        'cake': 114,
        'rice': 130,
        'pastry': 130,
        'rye': 120,
    },
    'sugar': {
        '*white': 200,
        'caster': 200,
        'superfine, super fine': 225,
        'granulated': { '*cane': 200 },
        'brown': {
            '*': 180,
            'soft': 220,
            'light': 220,
            'packed': 220,
            'dark': 200,
        },
        'muscovado': 200,
        'icing': 120,
        'confectioners, confectioner': 128,
    },
    'butter, margarine': 225,

    'mayo, mayonnaise': 228,

    'molasses, black treacle': 325,
    'honey': 340,
    'syrup, treacle': {
        'corn, golden, maple': 340,
    },

    'cornstarch, cornflour, corn starch, corn flour, maize flour': {
        '*': 120,
        'masa': 114,
    },
    'cornmeal, polenta, corn meal': 150,
    'barley': {
        '*pearl, pearled': 200,
    },
    'shortening': {
        '*vegetable': 190,
    },
    'lard': 225,

    'sultana, raisin': 170,
    'golden raisin': 150,
    'currant': 150,
    'blueberry': 100,
    'raspberry': 120,
    'strawberry': 200,
    'date, pitted date': 225,
    'dried cranberry': 140,
    'fresh cranberry': 110,
    'banana': 184,

    'jam, jelly, preserve': 325,
    'mincemeat': 225,
    'pumpkin puree': 250,

    // This one is dubious
    'almond': {
        '*whole': 140,
        'flaked': 85,
        'ground': 110,
    },
    'rice': {
        '*cooked': 200,
        'uncooked': 190,
    },
    'couscous': {
        '*cooked': 175,
        'uncooked': 180,
    },
    'oat': {
        '*uncooked': 90,
        'rolled': 85,
        'porridge': 85,
    },
    'peanut': {
        '*whole, shelled': 150,
        'chopped': 120,
        'butter': 250,
    },
    'walnut': {
        '*whole': 100,
        'chopped': 125,
    },
    'peanut butter': 250,
    'hazelnut': 135,
    'lentil': 190,

    'chocolate chip': 150,
    'cocoa powder': 125,
    'chocolate': {
        '*grated': 128,
        'melted': 227,
    },

    'salt, table salt': 300,
    // natural salt is 3/4 of that...

    'soy sauce': 276,
    'miso': 276,
    'mirin': 276,

    // TODO double cream and so on

    'cheese': {
        '*cream, soft': 120,
        'grated': {
            '*': 110,
            'cheddar': 120,
            'parmesan': 80,
        },
        'powder, powdered': 108,
    },

    'yoghurt, yogurt': 252,

    'pecan': {
        '*whole': 125,
        'chopped': 120,
        'halved': 100,
        'halfed': 100,
    },

    'nut': {
        '*whole': 140,
        'chopped': 130,
        'ground': 120,
    },

    'coconut': {
        '*cubed, desiccated': 100,
        'shredded': 75,
    },

    'breadcrumb': {
        '*plain': 120,
        'dry': 150,
        'fresh': 60,
    },
    'panko, panko breadcrumbs': 48,
    'graham crumb': 225,

    'dry pasta': 120,
    'rhubarb': 113,
    'poppy seed': 142,
    'whipping cream': 227,
    'water': LIQUID,
    'wine': {
        '*cooking': LIQUID,
    },
    // e.g. vegetable oil, sesame oil etc.
    'oil': LIQUID,
    'vinegar': LIQUID,

    'tomato': {
        'puree, pureed, purée, puréed': 276,
        'ketchup': 288,
    },

    'worchester sauce, worchestershire sauce': 288,
    'chuunou sauce, tonkatsu sauce, takoyaki sauce, okonomiyaki sauce': 300,
    'mentsuyu': 276,
};

/*
 * Expand cup conversion chart above into an internal representation for cupToGrams
 *  - expand single values to { "*": value }
 *  - duplicate values for comma-separated ingredients
 *  - add '*' wildcard entry based on whatever variant starts with a star
 *  - add plural forms
 *  - add American forms
 */
// TODO this should return CupData or similar
export function makeCupLUT(rawData: CupData): { [key: string]: any } {
    // TODO tighten signature
    let out: { [key: string]: any } = {};

    for (const [ingredients, rawValue] of Object.entries(rawData)) {
        for (const ingredient of ingredients.split(/\s*,\s*/)) {
            let _table;
            if (typeof rawValue === 'number') {
                _table = makeCupLUTVariantTable({ '*': rawValue }, ingredient);
            } else {
                // object
                _table = makeCupLUTVariantTable(rawValue, ingredient);
            }
            const table = _table;

            let forms = _.flatten(
                britishToAmerican(ingredient).map((x) => [x, pluralize(x)]),
            );

            // This is not handled by pluralize() - we want to match on this in addition
            // to the standard plural (e.g. 'barleys')
            if (ingredient === 'barley' || ingredient === 'parsley') {
                // Standard/correct plural is 'barleys' but 'barlies' is possible
                forms.push(ingredient.replace(/ley$/, 'lies'));
            }

            for (const keyword of _.uniq(forms)) {
                out[keyword] = table;
            }
        }
    }

    return out;
}

/*
 * Make an object mapping ingredient variants to values (or another variant table)
 * For example the value part of "flour": { "*white": 120, "sieved": 110 }
 *  - Add '*' wildcard entry based on whatever variant starts with a star
 *  - Add American forms. For example "sugar": { "icing": } will be duplicated as "confectioners"
 */
function makeCupLUTVariantTable(
    rawValues: CupDataEntry,
    ingredient: string,
): CupDataEntry {
    if (typeof rawValues === 'number') {
        return rawValues;
    }

    // TODO: tighten signature
    let out: { [key: string]: any } = {};

    for (let [variants, subValue] of Object.entries(rawValues)) {
        // First map the subValue the same way
        subValue = makeCupLUTVariantTable(subValue, ingredient);

        if (variants.startsWith('*') && variants !== '*') {
            // copy value to '*' (shorthand)
            variants = variants.substr(1);
            out['*'] = subValue;
        }

        for (const variant of variants.split(/\s*,\s*/)) {
            // Check for an American equivalent. For example the 'icing' variant of 'sugar'
            // should be mapped to 'powdered' because powdered sugar == icing sugar
            let fullIngredient = `${variant} ${ingredient}`;
            for (let yankWord of britishToAmerican(fullIngredient)) {
                if (yankWord === fullIngredient) break;
                yankWord = yankWord.replace(` ${ingredient}`, '');
                out[yankWord] = subValue;
            }
            // TODO could remove this and merge with loop above
            out[variant] = subValue;
        }
    }

    // Anything melted is going to be liquid, so 240ml/cup
    // ^ removed and put into the cupToGrams function directly for now
    //out['melted'] = LIQUID;

    // If we didn't add any variants, return it as a number. This is not necessary
    // but makes the LUT easier to read when testing it.
    if (Object.keys(out).length === 1 && '*' in out) return out['*'];
    return out;
}

// Nested hash mapping ingredients (and keywords) to grams per cup
export const cupLUT = makeCupLUT(cupConversions);

/* Return an array of words from the string, lowercased without punctuation */
function extractWords(text: string): string[] {
    return text.split(/\s+/).map((s) => s.replace(/[^a-z]/g, '').toLowerCase());
}

/* Remove a word from the input and return it; or return null */
function removeWord(input: string, wordToRemove: string): string | null {
    const regex = new RegExp('\\b' + regexp.escape(wordToRemove) + '\\b');
    let matched = false;

    let newInput = input.replace(regex, () => {
        matched = true;
        return '';
    });
    return matched ? newInput : null;
}

// Return the number of words in this string. '*' is considered to have 0 words,
// as it matches (and consumes) nothing.
function wordCount(string: string): number {
    if (string === '*') return 0;
    else return string.split(' ').length;
}

/* 
   Given an ingredient such as 'flour', 'white flour', 'all-purpose sifted white flour'
   Return the number of grams per cup of this ingredient, or null if we don't know.

   This is done by removing ingredients or modifiers (such as 'halved', 'cooked' etc.)
   from the string irrespective of order. (You can have 'nuts (halved)' or 'halved nuts')
   The largest combination of words matched is considered the winner, which allows
   'rice flour' to match flour->rice instead of just 'rice'. If there was a 'flour rice'
   though, we'd return an arbitrary match at this point.
*/
export function cupToGrams(ingredient: string): number | null {
    // Normalize input: case, punctuation, spacing
    ingredient = extractWords(ingredient).join(' ');
    if (ingredient.match(/\bmelted\b/)) return LIQUID;

    let bestMatch: { words: number; match: number | null } = {
        words: 0,
        match: null,
    };
    searchLUT(ingredient);
    return bestMatch.match;

    function searchLUT(input: string, lut = cupLUT, words = 0, prefix = '') {
        for (let [k, v] of Object.entries(lut)) {
            // Try wildcard last
            if (k === '*') continue;

            const newInput = removeWord(input, k);
            if (newInput === null) continue;

            words += wordCount(k);

            if (typeof v === 'number') {
                if (words > bestMatch.words) {
                    bestMatch = { words: words, match: v };
                }
            } else if (typeof v == 'object' && v !== null) {
                searchLUT(newInput, v, words, `${prefix}.${k}`);
            } else {
                // unexpected
            }
        }

        // Now try wildcard
        if ('*' in lut && words > bestMatch.words) {
            bestMatch = { words: words, match: lut['*'] };
        }
    }
}
