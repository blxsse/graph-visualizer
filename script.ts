const NODE_SIZE = 10;
const CANVAS_SIZE = 100; // needs to be changed in the index.html file as well
const NUMBER_NODES_PER_SIDE = CANVAS_SIZE / NODE_SIZE;

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement ?? null;
if (canvas === undefined || canvas === null) {
    throw new Error;
}
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
// TODO draw the grid first
for (let i = 0; i < CANVAS_SIZE; i = i + NODE_SIZE) {
    for (let j = 0; j < CANVAS_SIZE; j = j + NODE_SIZE) {
        sketchBox(canvas, i, j, NODE_SIZE, NODE_SIZE, 1, 'black');
    }
}

function indexToCoordinates(index: number): {x: number, y: number} {
    return {x: index % NODE_SIZE, y: Math.floor(index/NODE_SIZE)};
}

function pixelToCoordinates(horizontal: number, vertical: number): {x: number, y: number} {
    console.log(horizontal);
    console.log(vertical);
    return {x: Math.floor(horizontal / NODE_SIZE), y: Math.floor(vertical/NODE_SIZE)};
}

function coordinatesToIndex(x: number, y: number) {
    return x * NODE_SIZE + y;
}

function isCornerIndex(index: number, size: number): boolean {
    return index === 0 || index === size - 1 || index === size*size - 1 || index === size * (size - 1);
}

function isSideIndex(index: number, size: number): boolean {
    return Math.floor(index / size) === 0 || index % size === 0 || Math.floor(index / size) === size - 1 || index % size === size - 1;
}

function generateSquareNeighbors(size: number): Map<number, Array<number>> {
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

async function pause(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {setTimeout(() => resolve(), ms);});
}
canvas.addEventListener('click', (async (event: MouseEvent) => {
    console.log('here');
    const coordinates = pixelToCoordinates(event.offsetY, event.offsetX);
    const index = coordinatesToIndex(coordinates.x, coordinates.y);
    console.log(coordinates);
    const adjacencies = generateSquareNeighbors(NUMBER_NODES_PER_SIDE);
    const levelSets = BFS(index, adjacencies);
    console.log(levelSets); // DEBUG OUTPUT, DELETE LATER
    const levels = levelSets.values();
    if (levels === undefined || levels === null) {throw new Error;}
    for (const level of levels) {
        for (const vertex of level) {
            const coordinates = indexToCoordinates(vertex);
            console.log(coordinates);
            fillBox(canvas, coordinates.x*NODE_SIZE, coordinates.y*NODE_SIZE, NODE_SIZE, NODE_SIZE, 'black');
        }
        await pause(500);
    }

}));