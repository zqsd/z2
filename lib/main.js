"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = void 0;
// source https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
function long2tile(lon, numTiles) {
    return Math.floor((lon + 180) / 360 * numTiles);
}
function lat2tile(lat, numTiles) {
    return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * numTiles);
}
function tile2long(x, z) {
    return (x / Math.pow(2, z) * 360 - 180);
}
function tile2lat(y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}
// power of two until power 26 (max z)
const GOOGLE_TILES = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216, 33554432, 67108864];
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
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this._id = 0;
        this._binary = '';
        if (id) {
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
        for (i = bin.length - 1; i > 1; i--) {
            if (bin.charCodeAt(i) === 49)
                break;
        }
        const z = Math.ceil((i - 1) / 2);
        let x = 0, y = 0;
        for (let i = 0, j = z - 1; i < z * 2; i += 2, j--) {
            x |= ((bin.charCodeAt(i) === 49) ? 1 : 0) << j;
            y |= ((bin.charCodeAt(i + 1) === 49) ? 1 : 0) << j;
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
    static fromTile(x, y, z, customNumTiles = GOOGLE_TILES) {
        if (z < 0 || z > 26) {
            throw new Error(`Incorrect level z=${z}`);
        }
        if (x < 0 || x >= customNumTiles[z]) {
            throw new Error('x out of bounds');
        }
        if (y < 0 || y >= customNumTiles[z]) {
            throw new Error('x out of bounds');
        }
        let bin = '';
        if (z > 0) {
            for (let mask = 1 << (z - 1); mask !== 0; mask = mask >> 1) {
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
    static fromBoundsToCustomTile(bounds, customNumTiles) {
        for (let z = 26; z > 0; z--) {
            const numTiles = customNumTiles[z];
            const x0 = long2tile(bounds.minLng, numTiles), y0 = lat2tile(bounds.minLat, numTiles), x1 = long2tile(bounds.maxLng, numTiles), y1 = lat2tile(bounds.maxLat, numTiles);
            if (x0 === x1 && y0 === y1)
                return Cell.fromTile(x0, y0, z, customNumTiles);
        }
        throw new Error('Failed to tile from bounds');
    }
    static fromLatLngToCustomTile(lat, lng, z = 26, customNumTiles) {
        if (z > 26) {
            throw `Level ${z} incorrect`;
        }
        const numTiles = customNumTiles[z];
        const x = long2tile(lng, numTiles), y = lat2tile(lat, numTiles);
        return Cell.fromTile(x, y, z, customNumTiles);
    }
    static fromLatLngToGoogleTile(lat, lng, z = 26) {
        return Cell.fromLatLngToCustomTile(lat, lng, z, GOOGLE_TILES);
    }
    static fromBoundsToGoogleTile(bounds) {
        return Cell.fromBoundsToCustomTile(bounds, GOOGLE_TILES);
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
        if (this.id < b.id)
            return -1;
        else if (this.id > b.id)
            return 1;
        return 0;
    }
}
exports.Cell = Cell;
