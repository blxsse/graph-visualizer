const NODE_SIZE = 30;
const CANVAS_SIZE = 900; // needs to be changed in the index.html file as well
const NUMBER_NODES_PER_SIDE = CANVAS_SIZE / NODE_SIZE;

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement ?? null;
if (canvas === undefined || canvas === null) {
    throw new Error;
}

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
function sketchBox(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number, thickness: number, color: string): void {
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
function fillBox(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number, color: string): void {
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

/**
 * Converts flattened 2D matrix index to grid coordinates.
 * 
 * @param index flattened index location
 * @returns coordinates where the origin is the upper left corner of the grid
 */
function indexToCoordinates(index: number): {x: number, y: number} {
    return {x: index % NODE_SIZE, y: Math.floor(index/NODE_SIZE)};
}

/**
 * Converts pixel location to grid coordinates.
 * 
 * @param horizontal pixel's x-coordinate
 * @param vertical pixel's y-coordinate
 * @returns coordinates where the origin is the upper left corner of the grid
 */
function pixelToCoordinates(horizontal: number, vertical: number): {x: number, y: number} {
    return {x: Math.floor(horizontal / NODE_SIZE), y: Math.floor(vertical/NODE_SIZE)};
}

/**
 * Converts grid coordinates to flattened index.
 * 
 * @param x 
 * @param y 
 * @returns flattened index
 */
function coordinatesToIndex(x: number, y: number) {
    return x * NODE_SIZE + y;
}

/**
 * Checks if the given index represents a corner grid block.
 * 
 * @param index flattened index
 * @param size side length of square grid
 * @returns true if the index represents a corner grid block.
 */
function isCornerIndex(index: number, size: number): boolean {
    return index === 0 || index === size - 1 || index === size*size - 1 || index === size * (size - 1);
}

/**
 * Checks if the given index represents a side grid block.
 * 
 * @param index flattened index
 * @param size side length of square grid
 * @returns true if the index represents a side grid block.
 */
function isSideIndex(index: number, size: number): boolean {
    return Math.floor(index / size) === 0 || index % size === 0 || Math.floor(index / size) === size - 1 || index % size === size - 1;
}

/**
 * Given a square grid of side length `size`, computes neighbors of all blocks in the grid.
 * 
 * @param size side length of square grid
 * @returns adjacency list
 */
function generateSquareNeighbors(size: number): Map<number, Array<number>> {
    const neighbors = new Map<number, Array<number>>();
    const total = size * size;
    for (let i = 0; i < total; i++) {
        const currentNeighbors: Array<number> = [];

        // elements on the side of the square will not have all 4 possible neighbors.
        // possibilities: corner (2 neighbors), just the side (3 neighbors)
        // corners

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

        // sides
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
 * Performs breadth-first search (BFS) on a graph beginning at the vertex `start`
 * and finds the level sets.
 * 
 * @param start vertex to start BFS from
 * @param adjacencies adjacency list
 * @returns level sets indicating when vertices have been explored
 */
function BFS(start: number, adjacencies: Map<number, Array<number>>): Map<number, Array<number>> {
    // defensively copy
    const adjacencyList = new Map<number, Array<number>>();
    for (const node of adjacencies.keys()) {
        const copiedNeighbors = [];
        const neighbors = adjacencies.get(node);
        if (neighbors === undefined || neighbors === null) {throw new Error;}
        for (const neighbor of neighbors) {
            copiedNeighbors.push(neighbor);
        }
        adjacencyList.set(node, copiedNeighbors);
    }

    // keep track of already visited nodes
    const visited: Set<number> = new Set([start]);
    const queue: Array<number> = [start];

    // build level sets
    let currentLevel = 0;
    const levelsToNodes = new Map<number, Array<number>>();
    levelsToNodes.set(0, [start]);
    const nodesToLevels = new Map<number, number>();
    nodesToLevels.set(start, 0);

    while (queue.length > 0) {
        const currentNode = queue.shift();
        if (currentNode === undefined || currentNode === null) {throw new Error;}
        const newLevel = nodesToLevels.get(currentNode);
        if (newLevel === undefined || newLevel === null) {throw new Error;}
        if (newLevel > currentLevel) {
            currentLevel++;
        }
        const neighbors = adjacencyList.get(currentNode);

        if (neighbors === undefined || neighbors === null) {throw new Error;}
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
                const buildingLevel = levelsToNodes.get(currentLevel + 1);
                if (buildingLevel !== undefined) {
                    buildingLevel.push(neighbor);
                }

                else {
                    levelsToNodes.set(currentLevel + 1, [neighbor]);
                }
                nodesToLevels.set(neighbor, currentLevel + 1);
            }
        }
    }

    return levelsToNodes;
}

/**
 * Returns a promise that will resolve after `ms` milliseconds.
 * 
 * @param ms number of milliseconds that the pause should last for
 * @returns promise that resolves after `ms` milliseconds
 */
async function pause(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {setTimeout(() => resolve(), ms);});
}

/**
 * Runs BFS and colors in the graph based on the user's choice of starting vertex.
 * 
 * @param event mouse click
 */
async function userBFS(event: MouseEvent, currentColor: Record<string, string>): Promise<void> {
    const coordinates = pixelToCoordinates(event.offsetY, event.offsetX);
    const index = coordinatesToIndex(coordinates.x, coordinates.y);
    const adjacencies = generateSquareNeighbors(NUMBER_NODES_PER_SIDE);
    const levelSets = BFS(index, adjacencies);
    const levels = levelSets.values();
    if (levels === undefined || levels === null) {throw new Error;}
    currentColor = {r: '00', g: 'c1', b: 'ff'};
    for (const level of levels) {
        for (const vertex of level) {
            const coordinates = indexToCoordinates(vertex);
            fillBox(canvas, coordinates.x*NODE_SIZE, coordinates.y*NODE_SIZE, NODE_SIZE, NODE_SIZE, `#${currentColor['r']}${currentColor['g']}${currentColor['b']}`);
        }
        const green = currentColor['g'];
        if (green === undefined || green === null) {throw new Error;}
        let currentColorValue = parseInt(green, 16);
        currentColorValue += 3;
        let stringifiedValue = currentColorValue.toString(16);
        if (stringifiedValue.length > 2) {
            stringifiedValue = "FF";
        }
        currentColor['g'] = stringifiedValue.length === 2? stringifiedValue : "0" + stringifiedValue;

        const red = currentColor['r'];
        if (red === undefined || red === null) {throw new Error;}
        currentColorValue = parseInt(red, 16);
        currentColorValue += 3;
        stringifiedValue = currentColorValue.toString(16);
        if (stringifiedValue.length > 2) {
            stringifiedValue = "FF";
        }
        currentColor['r'] = stringifiedValue.length === 2? stringifiedValue : "0" + stringifiedValue;
        await pause(100);

    }
}

function main() {
    // Draw the grid
    for (let i = 0; i < CANVAS_SIZE; i = i + NODE_SIZE) {
        for (let j = 0; j < CANVAS_SIZE; j = j + NODE_SIZE) {
            sketchBox(canvas, i, j, NODE_SIZE, NODE_SIZE, 1, 'black');
        }
    }

    const currentColor = {'r': '00', 'g': 'c1', 'b': 'ff'}; // modify later to multiple starter gradients

    canvas.addEventListener('click', (async (event: MouseEvent) => {
        userBFS(event, currentColor);
    }));
}

main();
