// Global constants and useful functions.

export const NODE_SIZE = 30;
export const CANVAS_SIZE = 900; // needs to be changed in the index.html file as well
export const NUMBER_NODES_PER_SIDE = CANVAS_SIZE / NODE_SIZE;

export enum SPEED {SLOW, REGULAR, FAST}
/**
 * Draws a rectangle with dimensions `width` x `height` and upper left corner coordinate (x, y).
 * 
 * @param canvas 
 * @param x upper left corner's x-coordinate
 * @param y upper left corner's y-coordinate
 * @param width 
 * @param height 
 * @param thickness border thickness
 * @param color border color
 */
export function sketchBox(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number, thickness: number, color: string): void {
    const context = canvas.getContext("2d");
    if (context === undefined || context === null) {
        throw new Error;
    }
    context.save();
    context.translate(x, y);
    context.strokeStyle = color;
    context.lineWidth = thickness;
    context.strokeRect(0, 0, width, height);
    context.restore();
}

/**
 * Fills in a rectangle with dimensions `width` x `height` and upper left corner coordinate (x, y).
 * 
 * @param canvas 
 * @param x upper left corner's x-coordinate
 * @param y upper left corner's y-coordinate
 * @param width 
 * @param height 
 * @param color 
 */
export function fillBox(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number, color: string): void {
    const context = canvas.getContext("2d");
    if (context === undefined || context === null) {
        throw new Error;
    }
    context.save();
    context.translate(x, y);
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
    context.restore();
}

export function indexToCoordinates(index: number): {x: number, y: number} {
    return {x: index % NODE_SIZE, y: Math.floor(index/NODE_SIZE)};
}

export function pixelToCoordinates(horizontal: number, vertical: number): {x: number, y: number} {
    return {x: Math.floor(horizontal / NODE_SIZE), y: Math.floor(vertical/NODE_SIZE)};
}

export function coordinatesToIndex(x: number, y: number) {
    return x * NODE_SIZE + y;
}

export function isCornerIndex(index: number, size: number): boolean {
    return index === 0 || index === size - 1 || index === size*size - 1 || index === size * (size - 1);
}

export function isSideIndex(index: number, size: number): boolean {
    return Math.floor(index / size) === 0 || index % size === 0 || Math.floor(index / size) === size - 1 || index % size === size - 1;
}

/**
 * Generates a dictionary of neighbors for a square grid of side length `size`.
 * 
 * @param size number of boxes on the side of the square.
 * @returns a map with each box in the square grid having a key and their 
 * respective values being an array of neighbors.
 */
export function generateSquareNeighbors(size: number): Map<number, Array<number>> {
    const neighbors = new Map<number, Array<number>>();
    const total = size * size;
    for (let i = 0; i < total; i++) {
        const currentNeighbors: Array<number> = [];
        // elements on the side of the square will not have all 4 possible neighbors.
        // possibilities: corner (2 neighbors), just the side (3 neighbors)
        // do corners, happens when i === 0, i === size - 1, i === size * size - 1, i = size * (size - 1)

        if (isCornerIndex(i, size)) {
            switch (i) {
            case 0: {
                const rightIndex = i + 1;
                const bottomIndex = i + size;
                if (rightIndex < total) currentNeighbors.push(rightIndex);
                if (bottomIndex < total) currentNeighbors.push(bottomIndex);
                break;
            }
            case size - 1: {
                const leftIndex = i - 1;
                const bottomIndex = i + size;
                if (leftIndex < total) currentNeighbors.push(leftIndex);
                if (bottomIndex < total) currentNeighbors.push(bottomIndex);
                break;
            }
            case (size * size) - 1: {
                const leftIndex = i - 1;
                const topIndex = i - size;
                if (leftIndex < total) currentNeighbors.push(leftIndex);
                if (topIndex < total) currentNeighbors.push(topIndex);
                break;
            }
            case size * (size - 1): {
                const rightIndex = i + 1;
                const topIndex = i - size;
                if (rightIndex < total) currentNeighbors.push(rightIndex);
                if (topIndex < total) currentNeighbors.push(topIndex);
                break;
            }
            default:
                throw new Error("Mistakenly classified as corner index");
            }
        }

        // do sides
        else if (isSideIndex(i, size)) {
            if (Math.floor(i / size) === 0) { // top row
                const rightIndex = i + 1;
                const leftIndex = i - 1;
                const bottomIndex = i + size;
                if (rightIndex < total) currentNeighbors.push(rightIndex);
                if (leftIndex < total) currentNeighbors.push(leftIndex);
                if (bottomIndex < total) currentNeighbors.push(bottomIndex);
            }

            else if (i % size === 0) { // left col
                const rightIndex = i + 1;
                const topIndex = i - size;
                const bottomIndex = i + size;
                if (rightIndex < total) currentNeighbors.push(rightIndex);
                if (topIndex < total) currentNeighbors.push(topIndex);
                if (bottomIndex < total) currentNeighbors.push(bottomIndex);
            }

            else if (Math.floor(i / size) === size - 1) { // bottom row
                const rightIndex = i + 1;
                const topIndex = i - size;
                const leftIndex = i - 1;
                if (rightIndex < total) currentNeighbors.push(rightIndex);
                if (topIndex < total) currentNeighbors.push(topIndex);
                if (leftIndex < total) currentNeighbors.push(leftIndex);
            }

            else if (i % size === size - 1) { // right col
                const leftIndex = i - 1;
                const topIndex = i - size;
                const bottomIndex = i + size;
                if (leftIndex < total) currentNeighbors.push(leftIndex);
                if (topIndex < total) currentNeighbors.push(topIndex);
                if (bottomIndex < total) currentNeighbors.push(bottomIndex);
            }

            else {
                throw new Error("Mistakenly classified as side (not corner) index");
            }
        }

        // else
        else {
            const leftIndex = i - 1;
            const rightIndex = i + 1;
            const topIndex = i - size;
            const bottomIndex = i + size;
            const indices = [leftIndex, rightIndex, topIndex, bottomIndex];
            currentNeighbors.push(...indices);
        }
        neighbors.set(i, currentNeighbors);
    }
    return neighbors;
}

/**
 * Returns a promise that will resolve after `ms` milliseconds.
 * 
 * @param ms number of milliseconds that the pause should last for
 * @returns promise that resolves after `ms` milliseconds
 */
export async function pause(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {setTimeout(() => resolve(), ms);});
}

export function changeSpeed(newSpeed: string): SPEED {
    switch (newSpeed) {
    case 'slow':
        return SPEED.SLOW;
    case 'regular':
        return SPEED.REGULAR;
    case 'fast':
        return SPEED.FAST;
    default:
        throw new Error;
    }
}

export function levelsVisibility(visibility: string): boolean {
    return visibility === 'Yes';
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
    for (let i = 0; i < CANVAS_SIZE; i = i + NODE_SIZE) {
        for (let j = 0; j < CANVAS_SIZE; j = j + NODE_SIZE) {
            fillBox(canvas, i, j, NODE_SIZE, NODE_SIZE, 'white');
            sketchBox(canvas, i, j, NODE_SIZE, NODE_SIZE, 1, 'black');
        }
    }
}
