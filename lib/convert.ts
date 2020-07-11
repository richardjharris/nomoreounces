import { MeasureFinder } from './measure-finder';
import { convertOvenTemperatures } from './util/convert-oven-temperatures';
import { Unit } from './unit';

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
        let replacementText;

        if (['tablespoon', 'teaspoon', 'dessert spoon'].includes(match.unit.name)) {
            // Help the user by adding a millilitre (or gram) measurement afterwards
            // Need to know if it's a liquid or not.
            let metric = match.convertTo(Unit.named("millilitre"));
            metric.shortForm(true);
            metric.spaceAfter(false);
            // Round to whole numbers
            metric.setUnitAndAmount(metric.unit, Number(metric.amount.toFixed(0)));
            replacementText = match.originalString + ' (' + metric.toString() + ')';
        } else {
            let metric = match.convertToMetric();
            replacementText = metric.toString();
        }

        // Replace the original text with the conversion
        text = text.replace(match.originalString, replacementText);
    }

    text = convertOvenTemperatures(text);
    return text;
}
