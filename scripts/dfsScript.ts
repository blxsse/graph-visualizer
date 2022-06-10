import { NODE_SIZE, CANVAS_SIZE, NUMBER_NODES_PER_SIDE, sketchBox, fillBox, pixelToCoordinates, coordinatesToIndex, generateSquareNeighbors, indexToCoordinates, pause} from './utils';

const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement ?? null;
if (canvas === undefined || canvas === null) {
    throw new Error;
}

/**
 * Runs depth-first search (DFS) beginning from the vertex `start`.
 * 
 * @param start vertex to begin DFS from
 * @param adjacencies adjacency list
 * @returns 
 */
function DFS(start: number, adjacencies: Map<number, Array<number>>): Map<number, Array<number>> {
    // defensively copy
    const adjacencyList = new Map<number, Array<number>>();
    for (const node of adjacencies.keys()) {
        const copiedNeighbors = [];
        const currentNeighbors = adjacencies.get(node);
        if (currentNeighbors === undefined || currentNeighbors === null) {throw new Error;}
        for (const neighbor of currentNeighbors) {
            copiedNeighbors.push(neighbor);
        }
        adjacencyList.set(node, copiedNeighbors);
    }

    // keep track of already visited nodes
    const visited: Set<number> = new Set([start]);
    const stack: Array<number> = [start];

    // build level sets
    let currentLevel = 0;
    const levelsToNodes = new Map<number, Array<number>>();
    levelsToNodes.set(0, [start]);
    const nodesToLevels = new Map<number, number>();
    nodesToLevels.set(start, 0);

    while (stack.length > 0) {
        const currentNode = stack.pop();
        if (currentNode === undefined || currentNode === null) {throw new Error;}
        const level = nodesToLevels.get(currentNode);
        if (level === undefined || level === null) {throw new Error;}
        if (level > currentLevel) {
            currentLevel++;
        }
        const neighbors = adjacencyList.get(currentNode);
        if (neighbors === undefined || neighbors === null) {throw new Error;}
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                stack.push(neighbor);
                const next = levelsToNodes.get(currentLevel + 1);
                if (next !== undefined) {
                    next.push(neighbor);
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
 * Runs BFS and colors in the graph based on the user's choice of starting vertex.
 * 
 * @param event mouse click
 */
async function userDFS(event: MouseEvent, /*currentColor: Record<string, string>*/): Promise<void> {
    const coordinates = pixelToCoordinates(event.offsetY, event.offsetX);
    const index = coordinatesToIndex(coordinates.x, coordinates.y);
    const adjacencies = generateSquareNeighbors(NUMBER_NODES_PER_SIDE);
    const levelSets = DFS(index, adjacencies);
    const levels = levelSets.values();
    if (levels === undefined || levels === null) {throw new Error;}
    // currentColor = {r: '00', g: 'c1', b: 'ff'};
    for (const level of levels) {
        for (const vertex of level) {
            const coordinates = indexToCoordinates(vertex);
            fillBox(canvas, coordinates.x*NODE_SIZE, coordinates.y*NODE_SIZE, NODE_SIZE, NODE_SIZE, `black`);
            sketchBox(canvas, coordinates.x*NODE_SIZE, coordinates.y*NODE_SIZE, NODE_SIZE, NODE_SIZE, 1, 'black');
        }
        // const green = currentColor['g'];
        // if (green === undefined || green === null) {throw new Error;}
        // let currentColorValue = parseInt(green, 16);
        // currentColorValue += 3;
        // let stringifiedValue = currentColorValue.toString(16);
        // if (stringifiedValue.length > 2) {
        //     stringifiedValue = "FF";
        // }
        // currentColor['g'] = stringifiedValue.length === 2? stringifiedValue : "0" + stringifiedValue;

        // const red = currentColor['r'];
        // if (red === undefined || red === null) {throw new Error;}
        // currentColorValue = parseInt(red, 16);
        // currentColorValue += 3;
        // stringifiedValue = currentColorValue.toString(16);
        // if (stringifiedValue.length > 2) {
        //     stringifiedValue = "FF";
        // }
        // currentColor['r'] = stringifiedValue.length === 2? stringifiedValue : "0" + stringifiedValue;
        await pause(100);

    }
}

function dfsMain() {
    // Draw the grid
    for (let i = 0; i < CANVAS_SIZE; i = i + NODE_SIZE) {
        for (let j = 0; j < CANVAS_SIZE; j = j + NODE_SIZE) {
            sketchBox(canvas, i, j, NODE_SIZE, NODE_SIZE, 1, 'black');
        }
    }

    // const currentColor = {'r': '00', 'g': 'c1', 'b': 'ff'}; // modify later to multiple starter gradients

    canvas.addEventListener('click', (async (event: MouseEvent) => {
        userDFS(event, /*currentColor*/);
    }));
}

dfsMain();
