import { fahrenheitToCelsius } from './fahrenheit-to-celsius';
import { gasMarkToCelsius } from './celsius-to-gasmark';
import { round5 } from './number';

/**
 * Converts non-Celsius temperatures to Celsius. This includes Fahrenheit and
 * 'gas marks'. Where no temperature unit is specified, values above 250
 * are assumed to be in Fahrenheit.
 * 
 * Examples:
 *  "Preheat oven to 370°."
 *  "Preheat the oven to 350 degrees F."
 */
// TODO handle fractional gas marks
// TODO round numeric values
export function convertOvenTemperatures(text: string): string {
    // First try to match any number followed by a unit.
    var matched = false;
    text = text.replace(
        /(?:\b|^)(\d+)(\s*)(°|'|degrees?)?(\s*)(F|Fahrenheit|C|Centigrate|Celsius)(?:\b|$)/ism,
        (_, temp, space1, deg, space2, unit) => {
            // Convert the temperature if the unit is specified, or
            // the temperature is in a range that looks more like Fahrenheit
            // than Celsius.
            if ((unit && unit.toLowerCase().startsWith('f')) || temp > 250) {
                temp = round5(fahrenheitToCelsius(+temp));
                unit = unit.length == 1 ? 'C' : 'Celsius';
                matched = true;
            }
            return temp + space1 + deg + space2 + unit;
        },
    );
    if (matched) return text;

    // Try to match standalone numbers if they contain a suitable phrase
    text = text.replace(
        /\boven\s*to\s*(\d+)\s*(°|'|degrees?)?/i,
        (str, temp) => {
            if (temp > 250) {
                var newTemp = round5(fahrenheitToCelsius(+temp));
                matched = true;
                return `oven to ${newTemp}°C`;
            }
            return str;
        }
    );
    if (matched) return text;

    // Try to match gas marks, if we haven't matched the above
    text = text.replace(
        /gas\s*mark\s*([0-9])(?:\b|$)/i,
        (_, mark) => {
            var temp = round5(gasMarkToCelsius(+mark));
            matched = true;
            return `${temp}°C`;
        },
    );
    if (matched) return text;

    return text;
}