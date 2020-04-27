import { buildAlternationRaw } from './util/regexp';
import { unitData as rawUnitData, imperialToMetricMultiplier, UnitDomain, UnitSystem } from './data/unit-data';

import pluralize from 'pluralize';
import { AssertionError } from 'assert';

/** Represents a measurement unit. */
export class Unit {
    /**
     * Creates a Unit object. `named()` is a more common way to create one.
     * 
     * @param name - The lowercase (unless capitalisation is significant),
     *               singular full name of the unit, e.g. 'gram'
     * @param altnames - An array of alternate names for the unit, lowercase
     *                   and singular, e.g. 'g'
     * @param value - Relative scale to assign to the unit. For example if
     *                gram has value=1, kilogram should have value=1000.
     *                This is also relevant for `imperialToMetricRate`.
     * @param domain - Domain of unit (mass, volume etc.)
     * @param system - System of unit (imperial, metric)
     */

    constructor(
        public name: string,
        public altnames: Array<string> = [],
        public value: number,
        public domain: UnitDomain,
        public system: UnitSystem,
    ) {}

    /**
     * Returns all known Unit objects, keyed by their canonical name.
     * 
     * @returns {UnitMap} A mapping of canonical name (string) to a `Unit` object
     */
    static allUnits(): UnitMap {
        return extractUnitData.nameToUnit;
    }

    /**
     * Returns a unit by its canonical name. Throws an exception if
     * the unit does not exist. Callers should either use `allUnits()`
     * to source names, or use `fromString()` to speculatively test
     * arbitrary input.
     * 
     * @param name - Name of unit
     * @returns {Unit} Unit object
     * @throws {Error} No object matches the `name` provided.
     */
    static named(name: string): Unit {
        const unit = extractUnitData.nameToUnit[name];
        if (!unit) throw new Error(`unit ${name} does not exist`);
        return unit;
    }

    /**
     * Given a string, return the possible unit inside the string.
     * Unlike `named()` this supports spelling variants and shorthand,
     * and returns `null` if no matching unit could be found.
     */
    static fromString(str: string): Unit | null {
        // We add altnames for these, but just in case
        str = str.replace(/liter/i, 'litre');
        let unit = null;
    
        const match = str.match(extractUnitData.regex);
        if (match) {
            unit = extractUnitData.matchToUnit[match[0]];
            if (unit === undefined) {
                throw new Error(`unexpected: ${match[0]} returned by regex should be in matchToUnit`);
            }
        }
        return unit;
    }

    /**
     * Returns boolean indicating if the string unit is a short form (e.g. 'ml'
     * as opposed to 'millilitre')
     */
    static isShortForm(str: string): boolean {
        return str in extractUnitData.shortForm;
    }

    /**
     * Returns a regex that finds possible units.
     */
    static regex(): RegExp {
        return extractUnitData.regex;
    }

    /**
     * Returns the shortest form of the unit, e.g. 'g' for grams
     */
    shortForm(): string {
        return this.altnames[0];
    }

    /**
     * Indicates if the unit is metric or not.
     */
    isMetric() {
        return this.system == 'metric';
    }

    /**
     * Returns an array of units that are possible for conversion,
     * optionally filtered by system.
     * 
     * @param system - Optional system to filter on
     */
    possibleConversions(system?: UnitSystem): Array<Unit> {
        return extractUnitData.allUnits.filter((unit) => (
            unit.domain == this.domain
            && (!system || unit.system == system)
        ));
    } 

    /**
     * Indicate if a conversion between this unit and another is possible.
     */
    canConvert(to: Unit): boolean {
        return this.possibleConversions().some(u => u.name == to.name);
    }

    convert(arg: number): UnitWithValue;

    convert(arg: { to: Unit; val: number; }): number;

    /**
     * Convert a value from one unit to another. Args must be passed as an
     * object:
     * 
     * @param to - Desired unit
     * @param val - Numeric value in current unit
     * @returns Numeric value in desired unit
     * @throws Error if conversion is not possible (use canConvert first)
     * 
     * An alternative (clearer?) call style is available. The following are
     * equivalent:
     * 
     *     kg.convert({val: 100, to: lb})
     *     kg.convert(100).to(lb)
     * 
     */
    convert(arg: any): any {
        if (typeof arg == "number") {
            return new UnitWithValue(this, arg);
        }
        else if (typeof arg == "object") {
            var { to, val } = arg;

            if (this.domain != to.domain) {
                throw new Error('cannot convert between two different domains');
            }
            
            if (val == 0) {
                return 0;
            }
            else if (this.system == to.system) {
                // Simple case
                val *= (this.value / to.value);
            }
            else {
                // Convert val to the canonical unit for that system/domain
                val *= this.value;
                // Convert to new system's canonical unit
                var rate = imperialToMetricMultiplier[this.domain];
                if (this.system == "metric") rate **= -1;
                val *= rate;
                // Convert to desired unit
                val /= to.value;
            }
        
            return val;
        }
    }

    /**
     * Returns the best conversion for the amount, based on what is easiest
     * to read. For example '3.2kg' is preferred over '3200g'.
     * 
     * Args must be passed as an object:
     * 
     * @param val {number} - Numeric value in current unit
     * @param system {string} - (optional) unit system to filter to (metric/imperial)
     * @returns Object with keys: 'unit' and 'val', representing the converted unit and amount.
     *
     * An alternative call style is available. These two are equivalent:
     * 
     *     g.convertBest({val: 100, system: 'metric' });
     *     g.convert(1000).toBest('metric')
     */
    convertBest({ val, system }: { val: number; system?: UnitSystem; }): {unit: Unit, val: number} {
        const unitsToTry = this.possibleConversions(system);
        let bestUnit: Unit = this;
        let bestVal = val;

        // Returns a score indicating how readable the value is.
        const score = (val: number) => {
            val = Math.abs(val);
            // Fractional values are considered harder to read in most cases
            // But 1000g -> 1kg, not 2.2lb (!)
            // Also we don't want to convert to 'sticks' of butter or some nonsense
            if (val <= 1) return 0.5;
            return 1 - .1*(Math.log(val) / Math.log(10));
        };

        unitsToTry.forEach((unit) => {
            let newVal = this.convert(val).to(unit);
            if (score(newVal) > score(bestVal)) {
                bestUnit = unit;
                bestVal = newVal;
            }
        });

        return { unit: bestUnit, val: bestVal };
    }
}

class UnitWithValue {
    constructor(public unit: Unit, public value: number) {}

    to(to: string | Unit): number {
        if (typeof to === 'string') {
            to = Unit.named(to);
        }
        return this.unit.convert({ to, val: this.value });
    }

    toBest(system?: UnitSystem) {
        return this.unit.convertBest({ val: this.value, system });
    }
}

// The map does not contain any undefined values, but this forces users
// to verify their lookup into the map was successful.
type UnitMap = {[key: string]: Unit | undefined}

type ExtractUnitData = {
    // Regexp to match all possible unit names and variants (plural,
    // alternate forms)
    regex: RegExp,
    // Mapping of canonical and variant unit names to Unit
    matchToUnit: UnitMap,
    // Mapping of canonical unit name to Unit
    nameToUnit: UnitMap,
    // Mapping of canonical unit name to its short form
    shortForm: any,
    // List of units
    allUnits: Array<Unit>,
}
const extractUnitData: ExtractUnitData = precomputeExtractUnitData();

function precomputeExtractUnitData(): ExtractUnitData {
    var matchToUnit: UnitMap = {};
    var nameToUnit: UnitMap = {};
    var allUnits: Array<Unit> = [];
    var shortForm: UnitMap = {};

    for(const domain of Object.keys(rawUnitData) as UnitDomain[]) {
        for (const system of Object.keys(rawUnitData[domain]) as UnitSystem[]) {
            for (const entry of rawUnitData[domain][system]) {
                const unit = new Unit(
                    entry.name,
                    entry.altnames,
                    entry.value,
                    domain,
                    system,
                );

                nameToUnit[unit.name] = unit;
                allUnits.push(unit);

                matchToUnit[unit.name] = unit;
                matchToUnit[pluralize(unit.name)] = unit;
                for (const altname of unit.altnames) {
                    matchToUnit[altname] = unit;
                    matchToUnit[pluralize(altname)] = unit;

                    // The first altname is the 'short form' of the unit
                    if(!(unit.name in shortForm)) {
                        shortForm[altname] = unit;
                    }
                }
            }
        }
    }

    const unitRegex = buildAlternationRaw(Object.keys(matchToUnit));
    const regex = new RegExp('(?:^|\\b|\\d)' + unitRegex + '(?:$|\\b)', 'i');

    return { regex, matchToUnit, allUnits, nameToUnit, shortForm };
}