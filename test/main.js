const {Cell} = require('..');
const chai = require('chai'),
      expect = chai.expect;

describe('Cell', () => {

    it('constructor', () => {
        const a = new Cell();
        expect(a.z).to.equal(0);
        expect(a.x).to.equal(0);
        expect(a.y).to.equal(0);
        expect(a.toBinary()).to.equal('10000000000000000000000000000000000000000000000000000');
        expect(a.id).to.equal(4503599627370496);

        const b = new Cell(5114063333254307);
        expect(b.x).to.equal(34277200);
        expect(b.y).to.equal(24502605);
        expect(b.z).to.equal(26);
        expect(b.toBinary()).to.equal('10010001010110011011010101000010101100110010010100011');
        expect(b.id).to.equal(5114063333254307);
    });

    it('fromTile', () => {
        const b = Cell.fromTile(0, 0, 0),
              c = Cell.fromTile(3, 6, 9),
              a = Cell.fromTile(16346, 11684, 15);
        
        expect(b.x).to.equal(0);
        expect(b.y).to.equal(0);
        expect(b.z).to.equal(0);
        expect(b.toBinary()).to.equal('10000000000000000000000000000000000000000000000000000');
        expect(b.id).to.equal(4503599627370496);

        expect(c.x).to.equal(3);
        expect(c.y).to.equal(6);
        expect(c.z).to.equal(9);
        expect(c.toBinary()).to.equal('00000000000001111010000000000000000000000000000000000');
        expect(c.id).to.equal(1047972020224);

        expect(a.x).to.equal(16346);
        expect(a.y).to.equal(11684);
        expect(a.z).to.equal(15);
        expect(a.toBinary()).to.equal('00111011111011111001101001100010000000000000000000000');
        expect(a.id).to.equal(2108808746762240);
    });

    it('fromLatLngToGoogleTile', () => {
        const a = Cell.fromLatLngToGoogleTile(43.61092, 3.87723);
        expect(a.x).to.equal(34277200);
        expect(a.y).to.equal(24502605);
        expect(a.z).to.equal(26);
        expect(a.toBinary()).to.equal('10010001010110011011010101000010101100110010010100011');
        expect(a.id).to.equal(5114063333254307);

        const b = Cell.fromLatLngToGoogleTile(44.33969, 1.208369, 21);
        expect(b.x).to.equal(1055615);
        expect(b.y).to.equal(759806);
        expect(b.z).to.equal(21);
        expect(b.toBinary()).to.equal('10010001010100001110011111011111111111111010000000000'); 
        expect(b.id).to.equal(5112853556098048);
    });

    it('fromLatLngToGoogleTile', () => {
        const a = Cell.fromLatLngToCustomTile(43.61092, 3.87723, 1, [13, 77]);
        expect(a.x).to.equal(39);
        expect(a.y).to.equal(28);
        expect(a.z).to.equal(1);
        expect(a.toBinary()).to.equal('10100000000000000000000000000000000000000000000000000');
        expect(a.id).to.equal(5629499534213120);
    });

    it('can be compared', () => {
        const a = new Cell(),
              a2 = Cell.fromTile(0, 0, 0),
              b = Cell.fromTile(0, 0, 1),
              c = Cell.fromTile(0, 1, 1),
              d = Cell.fromTile(1, 0, 1),
              e = Cell.fromTile(1, 1, 1);
        expect(a.equals(a)).to.be.true;
        expect(a.equals(a2)).to.be.true;
        expect(a.equals(b)).to.be.false;
        expect(a.compare(a2)).to.equal(0);
        expect(b.compare(c)).to.equal(-1);
        expect(c.compare(d)).to.equal(-1);
        expect(d.compare(e)).to.equal(-1);
    });

    it('min/max', () => {
        const a = new Cell();
        expect(a.min().toBinary()).to.equal('00000000000000000000000000000000000000000000000000000');
        expect(a.max().toBinary()).to.equal('11111111111111111111111111111111111111111111111111111');

        const b = Cell.fromTile(0, 0, 1);
        expect(b.min().toBinary()).to.equal('00000000000000000000000000000000000000000000000000000');
        expect(b.max().toBinary()).to.equal('00111111111111111111111111111111111111111111111111111');

        const c = Cell.fromTile(0, 1, 1);
        expect(c.min().toBinary()).to.equal('01000000000000000000000000000000000000000000000000000');
        expect(c.max().toBinary()).to.equal('01111111111111111111111111111111111111111111111111111');

        const d = Cell.fromTile(1, 0, 1);
        expect(d.min().toBinary()).to.equal('10000000000000000000000000000000000000000000000000000');
        expect(d.max().toBinary()).to.equal('10111111111111111111111111111111111111111111111111111');

        const e = Cell.fromTile(1, 1, 1);
        expect(e.min().toBinary()).to.equal('11000000000000000000000000000000000000000000000000000');
        expect(e.max().toBinary()).to.equal('11111111111111111111111111111111111111111111111111111');
    });

    it('cell inclusion', () => {
        const a = new Cell(),
              b = Cell.fromTile(0, 0, 1),
              c = Cell.fromTile(0, 1, 1),
              d = Cell.fromTile(1, 0, 1),
              e = Cell.fromTile(1, 1, 1);
        const min = new Cell(a.min()),
              max = new Cell(a.max());
        expect(a.compare(min) >= 0 && a.compare(max) <= 0).to.be.true;
        expect(b.compare(min) >= 0 && b.compare(max) <= 0).to.be.true;
        expect(c.compare(min) >= 0 && c.compare(max) <= 0).to.be.true;
        expect(d.compare(min) >= 0 && d.compare(max) <= 0).to.be.true;
        expect(e.compare(min) >= 0 && e.compare(max) <= 0).to.be.true;
        expect(a.compare(new Cell(b.min().id)) < 0 || a.compare(new Cell(b.max().id)) > 0).to.be.true;
    });
});
