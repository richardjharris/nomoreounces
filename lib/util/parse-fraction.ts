// Library to parse fractions such as '1 1/2 cups' and replace them with
// decimals. Includes support for Unicode and HTML entities.

import { buildAlternationRaw } from './regexp';

var he = require('he');
const convertSubscript = mapNumerals('₀₁₂₃₄₅₆₇₈₉');
const convertSuperscript = mapNumerals('⁰¹²³⁴⁵⁶⁷⁸⁹');

const fractionGlyphs: { [key: string]: string } = {
    '¼': '1/4',
    '½': '1/2',
    '¾': '3/4',
    '⅐': '1/7',
    '⅑': '1/9',
    '⅒': '1/10',
    '⅓': '1/3',
    '⅔': '2/3',
    '⅕': '1/5',
    '⅖': '2/5',
    '⅗': '3/5',
    '⅘': '4/5',
    '⅙': '1/6',
    '⅚': '5/6',
    '⅛': '1/8',
    '⅜': '3/8',
    '⅝': '5/8',
    '⅞': '7/8',
};

const fractionSlash = /⁄/g;

// Regex representing everything we can convert
function _regex(): RegExp {
    const unicode = buildAlternationRaw(Object.keys(fractionGlyphs));
    const fraction = `(?:(?:[⁰¹²³⁴⁵⁶⁷⁸⁹\\d]+)\\s*[\\/⁄]\\s*(?:[₀₁₂₃₄₅₆₇₈₉\\d]+)|${unicode})/`;
    const decimal = '(?:\\d+(?:\\.\\d+)?)';
    const pattern = `(?:${fraction}|${decimal}(?:\\s+${fraction})?)`;

    return new RegExp(pattern, 'i');
}
export const regex = _regex();

// Return a function that takes a string and maps any numerals in the cipher
// to regular numbers. The cipher is a string containing the characters for
// 0-9 in order.
function mapNumerals(cipher: string): (_: string) => string {
    let regex = new RegExp('[' + cipher + ']');
    return (text) => {
        return text.replace(regex, (char) => {
            let offset = cipher.indexOf(char);
            return `${offset}`;
        });
    };
}

// Replace fractions in the string with decimals.
// TODO constanize these regexes
export function parseFraction(text: string): string {
    text = he.decode(text);

    Object.entries(fractionGlyphs).forEach(([glyph, textForm]) => {
        text = text.replace(glyph, ' ' + textForm + '');
    });

    text = text.replace(fractionSlash, '/');

    // Match fractions, removing spacing and converting sub-/super-script numerals
    text = text.replace(
        /([⁰¹²³⁴⁵⁶⁷⁸⁹\d]+)\s*\/\s*([₀₁₂₃₄₅₆₇₈₉\d]+)/g,
        (_, a, b) => convertSuperscript(a) + '/' + convertSubscript(b),
    );

    // Convert fractions to decimal
    const fracRe = /(\d+)\/(\d+)/;
    const numRe = /(\d+(?:\.\d+)?)/;
    const pattern = new RegExp(
        `(?:${fracRe.source}|${numRe.source}(?:\\s+${fracRe.source})?)`,
        'g',
    );

    return text
        .replace(pattern, (_, g1, g2, num, f1, f2) => {
            if (g1 !== undefined) {
                return g1 / g2;
            } else if (f1 != undefined) {
                return parseInt(num) + f1 / f2;
            } else {
                return num;
            }
        })
        .trim();
}
