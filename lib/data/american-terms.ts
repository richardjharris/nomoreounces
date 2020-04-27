import _ from 'lodash';

// TODO powder sugar, 'powder cake' -> icing sugar
// duplicate definitions here. should be a function?
const _americanToBritish = {
    'eggplant': 'aubergine',
    'canadian bacon': 'back bacon',
    'beet': 'beetroot',
    'hard candy': 'boiled sweet',
    'fava bean': 'broad bean',
    'cotton candy': 'candyfloss',
    'cilantro': 'coriander',
    'cornstarch': 'cornflour',
    'zucchini': 'courgette',
    'heavy cream': 'double cream',
    'graham crackers': 'digestive biscuits',
    'ginger snap': 'ginger nut',
    'bell pepper': 'green pepper',
    'powdered sugar': 'icing sugar',
    'confectioners sugar': 'icing sugar',
    'baked potato': 'jacket potato',
    'light cream': 'single cream',
    'white raisin': 'saltana',
    'molasses': 'treacle',
    'all-purpose flour': 'plain flour',
    'ap flour': 'plain flour',
    'canola oil': 'rapeseed oil',
    'kentucky beans': 'runner beans',
    'navy beans': 'haricot beans',
    'pie shell': 'pastry case',
    'saran wrap': 'cling film',
    'plastic wrap': 'cling film',
    'popsicle': 'ice lolly',
    'potato chips': 'crisps',
    'superfine granulated sugar': 'caster sugar',
    'tomato paste': 'tomato puree',
    'wax paper': 'greaseproof paper',
};
const _britishToAmerican = _.invert(_americanToBritish);

// TOOD This works for now but we want to require convert to do this before consulting the
// LUT. That's the only sane way to convert stuff like 'powder cake'
export function britishToAmerican(word: string): string[] {
    if (word === 'icing sugar') {
        return ['powdered sugar', 'confectioners sugar', 'powder sugar'];
    }

    const match = _britishToAmerican[word];
    if (match === undefined) {
        return [word];
    } else {
        return [word, match];
    }
}
