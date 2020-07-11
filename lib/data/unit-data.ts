/**
 * Thing that the unit measures. Conversion between domains can occasionally
 * be done if the ingredient is known.
 */
export type UnitDomain = 'mass' | 'volume';

/**
 * Indicates metric or imperial system of units, to allow converting from
 * one to the other.
 */
export type UnitSystem = 'metric' | 'imperial';

/**
 * Multiplier to convert from the imperial unit with value=1 to the metric unit
 * with value=1.
 */
export const imperialToMetricMultiplier: Record<UnitDomain, number> = {
    // lb -> gram
    mass: 453.592,
    // fl. oz. -> litre
    volume: 1 / 33.8140226,
};

type UnitDataEntry = {
    name: string;
    value: number;
    altnames: string[],
};
export type UnitData = Record<UnitDomain, Record<UnitSystem, UnitDataEntry[]>>;

/**
 * Human-readable unit data - divided by domain and system, with values that are
 * relative within the same domain/system.
 * This could be JSON but we want to use comments and inline calculations for readability.
 */
export const unitData: UnitData = {
    mass: {
        metric: [
            {
                name: 'milligram',
                value: 1 / 1000,
                altnames: ['mg'],
            },
            {
                name: 'gram',
                value: 1,
                altnames: ['g'],
            },
            {
                name: 'kilogram',
                value: 1000,
                altnames: ['kg'],
            },
        ],
        imperial: [
            {
                name: 'ounce',
                value: 1 / 16,
                altnames: ['oz'],
            },
            {
                name: 'pound',
                value: 1,
                altnames: ['lb'],
            },
        ],
    },
    volume: {
        metric: [
            {
                name: 'cubic centimeter',
                value: 1 / 1000,
                altnames: ['cc', 'cubic centimetre', 'cubic cm'],
            },
            {
                name: 'millilitre',
                value: 1 / 1000,
                altnames: ['ml', 'milliliter'],
            },
            {
                name: 'centilitre',
                value: 1 / 100,
                altnames: ['cl', 'centiliter'],
            },
            {
                name: 'declilitre',
                value: 1 / 10,
                altnames: ['dl', 'deliliter'],
            },
            {
                name: 'litre',
                value: 1,
                altnames: ['l', 'liter'],
            },
        ],
        imperial: [
            {
                name: 'teaspoon',
                value: 1 / 6,
                altnames: ['tsp', 'tspn', 't'],
            },
            {
                // US tablespoon (vs. UK: 0.51, Australian: 0.68)
                name: 'tablespoon',
                value: 1 / 2,
                altnames: ['tbsp', 'tbs', 'tbspn', 'T'],
            },
            {
                name: 'dessert spoon',
                value: 0.4,
                altnames: ['dsp', 'desert spoon'],
            },
            {
                name: 'fluid ounce',
                value: 1,
                altnames: ['fl oz', 'floz', 'oz fl', 'fl ounce', 'fluid oz'],
            },
            {
                name: 'cup',
                value: 8,
                altnames: ['c'],
            },
            {
                name: 'pint',
                value: 16,
                altnames: ['pnt'],
            },
            {
                name: 'quart',
                value: 32,
                altnames: ['qt', 'qrt'],
            },
            {
                name: 'gallon',
                value: 128,
                altnames: ['gal', 'glln', 'galln'],
            },
            {
                // Typically used for butter (each stick is 1/2 cup)
                name: 'stick',
                value: 4,
                altnames: ['stk'],
            },
        ],
    },
};
