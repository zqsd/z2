export interface BoundInterface {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}
export declare class Cell {
    x: number;
    y: number;
    z: number;
    _id: number;
    _binary: string;
    constructor(id?: number);
    set id(id: number);
    get id(): number;
    min(): Cell;
    max(): Cell;
    static fromTile(x: number, y: number, z: number): Cell;
    static fromBoundsToGoogleTile(bounds: BoundInterface): Cell;
    static fromLatLngToGoogleTile(lat: number, lng: number, z?: number): Cell;
    static fromBinary(bin: string): Cell;
    toBinary(): string;
    equals(b: Cell): boolean;
    compare(b: Cell): number;
}
