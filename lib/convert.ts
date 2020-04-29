import { MeasureFinder } from './measure-finder';
import { convertOvenTemperatures } from './util/convert-oven-temperatures';

/**
 * Converts arbitrary US-centric recipe text to UK-centric text.
 *
 * @remarks
 * This function accepts arbitrary text, but is optimised for elements
 * of e.g. a recipe list. It will scan the text for unit expressions such
 * as fluid ounces or cups, and convert the expression to a metric unit.
 * It will also convert American ingredient names ('cilantro' etc.) and
 * Fahrenheit oven temperatures.
 *
 * Cups are assumed to be American (240ml)
 *
 * @param text - Plain text to convert
 * @returns Converted text
 */
export function convertRecipeText(text: string): string {
    // text = BritishToAmerican.convert(text);

    // This part is tricky. We need to handle:
    //  - ingredient names (look around)
    //  - unit names
    //  - amounts, either numeric or English ('2 and a half', 'two dozen', fractions)
    for (const match of MeasureFinder.findAll(text)) {
        match.convertToMetric();
        console.log("str", match.originalString, match.toString());
        // Replace the original text with the conversion
        text = text.replace(match.originalString, match.toString());
    }

    text = convertOvenTemperatures(text);
    return text;
}
