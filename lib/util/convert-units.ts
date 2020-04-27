import { Unit } from '../unit';
import { cupToGrams } from '../data/cup-to-grams';
import pluralize from 'pluralize';
import * as regexp from './regexp';

/**
 * Amount - API for representing amounts in recipes
 *
 * @property measure numeric amount of unit
 * @property unit string unit name - 'gram', 'ounce' and so on, as defined
 *   in the unit data
 * @property ingredient - name of ingredient
 */
export class Amount {
    constructor(
        public measure: number,
        public unit: Unit,
        ingredient?: string,
    ) {}
}

/**
 * Converts a measure and unit (e.g 6.4 ounces) into an appropriate metric
 * measure and unit. The unit will be rounded.
 *
 * At this point, the parsing of unit and measure will have already been
 * done, so the measure should be a pure number (not strings like '1 and a half'
 * or fractions) and the unit must be a unit name as defined in the unit
 * data (e.g. 'fl-oz', not 'fluid ounces', 'fl. oz' or whatever else).
 *
 * If the amount contains an ingredient string, this will be parsed to
 * assist in converting cups to grams, and also interpreting ounces as
 * fluid ounces if applicable (e.g. '16 oz beer')
 */
export function convertAmount(amount: Amount): Amount {
    return amount;
}
