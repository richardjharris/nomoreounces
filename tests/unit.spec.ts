import { Unit } from '../lib/unit';
import { expect, assert } from 'chai';
import 'mocha';

// Acceptable error for unit conversions
const E = 0.001;

// Pre-init some basic units
const kg = Unit.named('kilogram');
const g = Unit.named('gram');
const mg = Unit.named('milligram');
const lb = Unit.named('pound');
const tsp = Unit.named('teaspoon');
const tbsp = Unit.named('tablespoon');
const cup = Unit.named('cup');
const ml = Unit.named('millilitre');
const flOz = Unit.named('fluid ounce');
const l = Unit.named('litre');
const cl = Unit.named('centilitre');
const oz = Unit.named('ounce');

// Sanity check named() first, since if that fails, all the later tests
// are unreliable.
describe('Unit.named', () => {
    it('returns the correct units', () => {
        expect(kg.name).to.be.equal('kilogram');
        expect(g.name).to.be.equal('gram');
        expect(cup.name).to.be.equal('cup');
    });
});

describe('Unit.allUnits', () => {
    it('returns a mapping of unit names to objects', () => {
        const units = Unit.allUnits();
        expect(units['gram']).to.be.eql(g);
        expect(units['litre']).to.be.eql(l);
    });
});

describe('Unit.shortForm', () => {
    it('returns a short form unit name', () => {
        expect(g.shortForm).equal('g');
        expect(tsp.shortForm).equal('tsp');
        expect(flOz.shortForm).equal('fl oz');
    });
});

describe('Unit.pluralName', () => {
    it('returns a plural unit name', () => {
        expect(g.pluralName).equal('grams');
        expect(tsp.pluralName).equal('teaspoons');
    });
});

describe('Unit.toString', () => {
    it('ensures short form is always singular', () => {
        expect(g.toString(1, true)).equal('g');
        expect(g.toString(100, true)).equal('g');
    });
    it('pluralizes correctly', () => {
        expect(kg.toString(1, false)).equal('kilogram');
        expect(kg.toString(100, false)).equal('kilograms');
    });
});

describe('Unit.canConvert', () => {
    it('returns true for valid conversions', () => {
        expect(g.canConvert(kg)).to.be.true;
        expect(g.canConvert(lb)).to.be.true;  // different system
        expect(tsp.canConvert(cup)).to.be.true;
        expect(lb.canConvert(g)).to.be.true;
        expect(lb.canConvert(kg)).to.be.true;
    });
    it('returns false for conversions between different domains', () => {
        expect(cup.canConvert(kg)).to.be.false;
        expect(tsp.canConvert(g)).to.be.false;
    });
});

describe('Unit.convert', () => {
    it('can do simple conversions across a single measurement', () => {
        expect(g.convert(1000).to(kg)).to.equal(1);
        expect(g.convert(1000).to(mg)).to.equal(1_000_000);
        expect(g.convert(1000).to(g)).to.equal(1_000, 'same');

        expect(g.convert(0).to(lb)).to.equal(0);
        expect(g.convert(0).to(g)).to.equal(0);

        // TODO negative numbers
        // TODO lengths
        // TODO US variants perhaps
    });
    it('can be called with an object', () => {
        expect(g.convert({ val: 1000, to: kg })).to.equal(1);
    });
    it('can convert to imperial', () => {
        expect(kg.convert(1).to(lb)).to.be.approximately(2.20462, E);
    });
    it('can convert volume too', () => {
        expect(l.convert(1).to(cl)).to.equal(100);
        expect(cl.convert(100).to(l)).to.equal(1);
        expect(tsp.convert(6).to(tbsp)).to.equal(2);
    });
    it('can convert volume to imperial', () => {
        const gallon = Unit.named('gallon');
        const litre = Unit.named('litre');

        expect(litre.convert(2).to(gallon)).to.be.approximately(0.528344, E);
        expect(gallon.convert(2).to(litre)).to.be.approximately(7.57082, E);
    });
});

describe('Unit.convertBest', () => {
    it('converts to the best unit', () => {
        expect(g.convert(1000).toBest()).to.eql({ val: 1, unit: kg });
        // 500g is easier to read than 0.5kg
        expect(g.convert(500).toBest('metric')).to.eql({ val: 500, unit: g });
        // 900g is easier to read than 0.9kg
        expect(g.convert(900).toBest('metric')).to.eql({ val: 900, unit: g });
    });
});

describe('Unit.fromString', () => {
    it('can extract basic units from strings', () => {
        expect(Unit.fromString('1 grams flour')).to.be.eql(g);
        expect(Unit.fromString('5 grams flour')).to.be.eql(g);
        expect(Unit.fromString('100g.')).to.be.eql(g);
        expect(Unit.fromString('100 g')).to.be.eql(g);
        expect(Unit.fromString('about 200ml')).to.be.eql(ml);
        expect(Unit.fromString('2tsp sugar')).to.be.eql(tsp);
        expect(Unit.fromString('3 tsps sugar')).to.be.eql(tsp);
        expect(Unit.fromString('5 tbsps')).to.be.eql(tbsp);
    });
    it('can match American terms', () => {
        expect(Unit.fromString('5 milliliters')).to.be.equal(ml);
    });
    it('can match various forms of fl oz', () => {
        for (const test in [
            'fluid ounces', 'fl. oz.', 'oz. fl.', 'fl-oz',
            'fluid oz', 'fl. ounce', 'fl oz', 'floz']) {
            it(`can match ${test}`, () => {
                expect(Unit.fromString(`42 ${test}`)).to.be.eql(flOz);
            });
        }
    });
});

describe('unit.possibleConversions', () => {
    it('returns the correct conversions', () => {
        expect(g.possibleConversions()).to.have.same.members([mg, g, kg, lb, oz]);
        expect(g.possibleConversions('metric')).to.have.same.members([mg, g, kg]);
    });
});

describe('unit.isMetric', () => {
    it('indicates if the unit is metric or not', () => {
        expect(g.isMetric()).to.be.true;
        expect(lb.isMetric()).to.be.false;
    });
});