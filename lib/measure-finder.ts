import { Unit } from './unit';
import { regex as numberRegex, parseFraction } from './util/parse-fraction';
import { cupToGrams } from './data/cup-to-grams';
import { rx } from './util/regexp';

const ONE_STICK_OF_BUTTER_GRAMS = 113;
const ONE_TEASPOON_ML = 5;
const ONE_TABLESPOON_ML = 15;
const ONE_CUP_LIQUID_ML = 240;

/**
 * Represents a measurement (unit and amount) that can be converted to its
 * metric equivalent. Optionally stores an ingredient for cup conversion.
 */
export class Measure {
    /**
     * Create a Measurement.
     * @param unit - The unit of the measurmeent
     * @param amount - Numerical amount of the measurement
     * @param originalString - String representing the originally matched text
     *     that corresponds to this measurement. This may be somewhat different,
     *     for example a string like '2 and a half cups of sugar' could correspond
     *     to a Measure(unit=cup, amount=2.5). This is used when converting the units.
     *
     * @param context - String representing the originally matched text and its
     *     surrounding context (typically a few words either side). This is used to
     *     determine the ingredient during cup conversions.
     */
    constructor(
        public unit: Unit,
        public amount: number,
        public originalString: string,
        public context: string,
        public _isShortForm: boolean = false,
        public _isSpaceAfter: boolean = true,
        public _isPlural: boolean = false,
    ) {}

    clone(): Measure {
        return Object.create(this);
    }

    setUnitAndAmount(unit: Unit | string, amount: number) {
        this.unit = typeof unit == 'string' ? Unit.named(unit) : unit;
        this.amount = amount;
    }

    shortForm(value: boolean): void {
        this._isShortForm = value;
    }

    spaceAfter(value: boolean): void {
        this._isSpaceAfter = value;
    }

    convertToMetric(): Measure {
        let m: Measure = this.clone();
        if (this.unit.isMetric()) return m;

        const fromCup = this.unit.name == 'cup';
    
        if (fromCup) {
            // Convert to g (or ml) depending on ingredient.
            const g = this.toGrams();
            // TODO better way of detecting 'is liquid'
            if (g == ONE_CUP_LIQUID_ML * this.amount) {
                m.setUnitAndAmount('millilitre', g);
            } else {
                m.setUnitAndAmount('gram', g);
            }

            // Use short forms for metric units.
            m.shortForm(true);
            m.spaceAfter(false);
        } else {
            // Imperial unit!
            // TODO stick
            const result = this.unit.convert(this.amount).toBest('metric');
            console.log(this.unit, this.amount, result);
            m.setUnitAndAmount(result.unit, result.val);
        }

        return m;
    }

    convertTo(destUnit: Unit): Measure {
        let m: Measure = this.clone();
        if (this.unit == destUnit) return m;

        // TODO cup conversion code is duplicated
        // TOOO having two different type signatures for convert() is dumb

        const amount = this.unit.convert(this.amount).to(destUnit);
        m.setUnitAndAmount(destUnit, amount);

        return m;
    }

    /**
     * @return the number of grams this measure would weigh.
     *
     * Intended for use with volume ingredients such as '1 cup sugar'
     * where we need to convert to a metric mass.
     */
    toGrams(): number {
        if (this.unit.domain == 'mass') {
            return this.unit.convert(this.amount).to('grams');
        } else {
            // Measurement is volume, so use cup conversion
            var cupToG = cupToGrams(this.context);
            if (cupToG === null) {
                throw new Error(
                    `conversion to grams failed: unknown ingredient '${this.context}'`,
                );
            }
            return this.unit.convert(this.amount).to('cup') * cupToG;
        }
    }

    /**
     * @return this measure in string form. Where possible, attempts to
     *     copy the style of the originally matched string.
     *
     * @todo Consider moving `originalString` to be an argument of this
     *     function, and creating a `MeasureMatch` or similar object.
     */
    toString(): string {
        // XXX Pick the correct unit name to use, and pluralize.
        const space = this._isSpaceAfter ? ' ' : '';

        return `${this.amount}${space}${this.unit.toString(this.amount, this._isShortForm)}`;
    }
}

/**
 * Class that scans a string for Amounts - recipe ingredients ('2 cups sugar') or simple
 * measurements such as '350 degrees F' or '2 inches'.
 */
export class MeasureFinder {
    /**
     * Given an arbitrary string, scan for ingredient strings such as '20 grams of flour'
     * - strings that contain a unit, amount and optional ingredient name.
     *
     * @param text Text to scan
     * @returns iterable of {@link Measure} objects representing matches
     */
    static findAll(text: string): Iterable<Measure> {
        // Our first pass uses a general regex that picks up 99% of ingredients
        // Ignore punctuation ("1 pouch (6.4 ounces) light tuna in water") ("5oz - unsalted butter") ("16-oz package...")
        // Ideally ignore HTML (strip it)
        // Numbers should handle fractions, decimals, "16-oz", "5oz", possibly typos like 'tablespons'
        // OTOH we need to preserve the original HTML to do conversion!!
        // Can imagine stuff like '1 and a half' too
        // Measures in cups/sticks; units (200'F), "1 can (8 ounce) of tomato sauce"
        // American terms (eggplant, Canadian bacon)
        // Ranges (1-2 cups)
        // Infer oz is unit of volume or mass based on ingredient
        const unitRegex = Unit.regex();

        // TODO \w+ is far too strict...
        // Matches: 0=whole string, 1 = unit + amount, 2 = unit, 3 = amount
        const regex = rx('gi')`
            (?:^|\b)
            (?:
                (?:
                    (
                        (${numberRegex})\s*(${unitRegex}(?:\b|$))
                    )
                )
                \s*
                (?:\w+\s*){0,5}
                (?:$|\b)
            )
        `;
        var matches = [];
        var match;
        do {
            match = regex.exec(text);
            if (match) {
                var amount = parseFraction(match[2]);
                if (amount != `${+amount}`) continue;
                var unit = Unit.fromString(match[3]);
                if (unit === null) continue;
                matches.push(
                    new Measure(
                        unit,
                        +amount,
                        match[1], // orignalString?
                        match[0], // context
                    ),
                );
            }
        } while (match);

        return matches;
    }
}
