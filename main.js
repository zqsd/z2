// source https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
function long2tile(lon, zoom) {
    return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
    return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
}
function tile2long(x, z) {
    return (x / Math.pow(2, z) * 360 - 180);
}
function tile2lat(y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return 180 / Math.PI * Math.atan(0.5 *(Math.exp(n) - Math.exp(-n)));
}

/*
 * Stores a (x, y) couple at a z level, into a 53 bits number (maximum safe integer in javascript)
 * x and y range from 0 to 2^z, then interleaved and the number is appened 1 and as many 0 as it could fit
 * for example 10000000000000000000000000000000000000000000000000000 is the cell x=0, y=0, z=0
 *
 * 00100000000000000000000000000000000000000000000000000 is x=0, y=0, z=1
 * 01100000000000000000000000000000000000000000000000000 is x=0, y=1, z=1
 * 10100000000000000000000000000000000000000000000000000 is x=1, y=0, z=1
 * 11100000000000000000000000000000000000000000000000000 is x=1, y=1, z=1
 * xy
 *
 * 10101010100000000000000000000000000000000000000000000 is x=15, y=0, z=4
 * xyxyxyxy
*/
class Cell {
    constructor(id) {
        if(id) {
            this.id = id;
        }
        else {
            this.id = 4503599627370496; // x=0 y=0 z=0
        }
    }

    set id(id) {
        this._id = id;
        let bin = this._id.toString(2);
        this._binary = bin = '0'.repeat(53 - bin.length) + bin;

        let i;
        for(i = bin.length - 1; i > 1; i--) {
            if(bin.charCodeAt(i) === 49)
                break;
        }
        const z = Math.ceil((i - 1) / 2);

        let x = 0,
            y = 0;
        for(let i = 0, j = z - 1; i < z * 2; i += 2, j--) {
            x |= (bin.charCodeAt(i) === 49) << j;
            y |= (bin.charCodeAt(i + 1) === 49) << j;
        }
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get id() {
        return this._id;
    }

    min() {
        const cell = new Cell();
        cell.x = this.x;
        cell.y = this.y;
        cell.z = this.z;
        cell._binary = this._binary.substring(0, this.z * 2) + '0'.repeat(53 - this.z * 2);
        cell._id = parseInt(cell._binary, 2);
        return cell;
    }

    max() {
        const cell = new Cell();
        cell.x = this.x;
        cell.y = this.y;
        cell.z = this.z;
        cell._binary = this._binary.substring(0, this.z * 2) + '1'.repeat(53 - this.z * 2);
        cell._id = parseInt(cell._binary, 2);
        return cell;
    }

    static fromTile(x, y, z) {
        if(z < 0 || z > 26) {
            throw `Incorrect level z=${z}`;
        }
        if(x < 0 || x >= Math.pow(2, z)) {
            throw 'x out of bounds';
        }
        if(y < 0 || y >= Math.pow(2, z)) {
            throw 'x out of bounds';
        }

        let bin = '';
        if(z > 0) {
            for(let mask = 1 << (z - 1); mask !== 0; mask = mask >> 1) {
                bin += (x & mask) !== 0 ? 1 : 0;
                bin += (y & mask) !== 0 ? 1 : 0;
            }
        }
        bin = bin + '1' + '0'.repeat(52 - bin.length);

        const cell = new Cell();
        cell._id = parseInt(bin, 2);
        cell.x = x;
        cell.y = y;
        cell.z = z;
        cell._binary = bin;
        return cell;
    }

    static fromBoundsToGoogleTile(bounds) {
        for(let z = 26; z > 0; z--) {
            const x0 = long2tile(bounds.minLng, z),
                  y0 = lat2tile(bounds.minLat, z),
                  x1 = long2tile(bounds.maxLng, z),
                  y1 = lat2tile(bounds.maxLat, z);
            if(x0 === x1 && y0 === y1)
                return Cell.fromTile([x0, y0], z);
        }
        throw 'fin';
    }

    static fromLatLngToGoogleTile(lat, lng, z = 26) {
        if(z > 26) {
            throw `Level ${z} incorrect`;
        }

        const x = long2tile(lng, z),
              y = lat2tile(lat, z);
        return Cell.fromTile(x, y, z);
    }

    static fromBinary(bin) {
        return new Cell(parseInt(bin, 2));
    }

    toBinary() {
        return '0'.repeat(53 - this._binary.length) + this._binary;
    }

    equals(b) {
        return this.id === b.id;
    }

    compare(b) {
        if(this.id < b.id)
            return -1;
        else if(this.id > b.id)
            return 1;
        return 0;
    }
};

module.exports = {
    Cell,
};