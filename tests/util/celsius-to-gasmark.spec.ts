import { celsiusToGasMark, gasMarkToCelsius } from '../../lib/util/celsius-to-gasmark';
import { expect } from 'chai';
import 'mocha';

describe('celsiusToGasMark function', () => {
    it('should return the correct gas mark', () => {
        expect(celsiusToGasMark(90)).to.equal(0.25);
        expect(celsiusToGasMark(100)).to.equal(0.25);
        expect(celsiusToGasMark(130)).to.equal(0.5);
        expect(celsiusToGasMark(140)).to.equal(1);
        expect(celsiusToGasMark(149)).to.equal(2);
        expect(celsiusToGasMark(150)).to.equal(2);
        expect(celsiusToGasMark(151)).to.equal(3);
        expect(celsiusToGasMark(280)).to.equal(11);
        expect(celsiusToGasMark(290)).to.equal(12);
        expect(celsiusToGasMark(300)).to.equal(13);
        expect(celsiusToGasMark(1000)).to.equal(13);
    });
});

// TODO does not handle fractions.
describe('gasMarkToCelsius function', () => {
    it('should return sensible values', () => {
        expect(gasMarkToCelsius(1)).to.be.above(130).and.below(145);
        expect(gasMarkToCelsius(7)).to.be.above(205).and.below(230);
        expect(gasMarkToCelsius(0.25)).to.be.above(100).and.below(110);
        expect(gasMarkToCelsius(0.5)).to.be.above(115).and.below(130);
        expect(gasMarkToCelsius(10)).to.be.above(250).and.below(280);
        expect(gasMarkToCelsius(9)).to.be.above(230).and.below(245);
        expect(() => gasMarkToCelsius(-1)).to.throw();
        expect(() => gasMarkToCelsius(100)).to.throw();
    });
});