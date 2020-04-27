import { round5 } from '../../lib/util/number';
import { expect } from 'chai';
import 'mocha';

describe('round5', () => {
    it('does not round low values to zero', () => {
        expect(round5(1)).to.equal(5);
    });
    it('keeps zero as zero', () => {
        expect(round5(0)).to.equal(0);
    })
    it('rounds other values to multiples of five', () => {
        expect(round5(3.3)).to.equal(5);
        expect(round5(11.1)).to.equal(10);
        expect(round5(200)).to.equal(200);
        expect(round5(201)).to.equal(200);
        expect(round5(206)).to.equal(205);
        expect(round5(6.33333333333)).to.equal(5);
        expect(round5(7.5)).to.equal(10, 'rounds up');
    })
})