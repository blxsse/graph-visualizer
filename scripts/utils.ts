// Global constants and useful functions.

export const NODE_SIZE = 10;
export const CANVAS_SIZE = 100; // needs to be changed in the index.html file as well
export const NUMBER_NODES_PER_SIDE = CANVAS_SIZE / NODE_SIZE;

export function indexToCoordinates(index: number): {x: number, y: number} {
    return {x: index % NODE_SIZE, y: Math.floor(index/NODE_SIZE)};
}

export function pixelToCoordinates(horizontal: number, vertical: number): {x: number, y: number} {
    return {x: horizontal % NODE_SIZE, y: Math.floor(vertical/NODE_SIZE)};
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
            // TODO
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
