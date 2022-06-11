import { NODE_SIZE, CANVAS_SIZE, NUMBER_NODES_PER_SIDE, sketchBox, fillBox, pixelToCoordinates, coordinatesToIndex, generateSquareNeighbors, indexToCoordinates, pause, SPEED, changeSpeed, levelsVisibility, clearCanvas} from './utils';

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
 * Runs DFS and colors in the graph based on the user's choice of starting vertex.
 * 
 * @param event mouse click
 */
async function userBFS(canvas: HTMLCanvasElement, event: MouseEvent, currentColor: Record<string, string>, animationSpeed: SPEED, levelsAreVisible: boolean): Promise<void> {
    const resetButton = document.getElementById("reset-button") as HTMLButtonElement ?? null;
    if (resetButton === undefined || resetButton === null) {throw new Error;}
    resetButton.disabled = true;
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
            sketchBox(canvas, coordinates.x*NODE_SIZE, coordinates.y*NODE_SIZE, NODE_SIZE, NODE_SIZE, 1, 'black');
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
        let ms: number;
        switch (animationSpeed) {
        case SPEED.SLOW:
            ms = 200;
            break;
        case SPEED.REGULAR:
            ms = 100;
            break;
        case SPEED.FAST:
            ms = 50;
            break;
        }
        if (levelsAreVisible) {
            // TODO add levels output to some output screen
        }
        await pause(ms);

    }
    resetButton.disabled = false;
    activate(canvas);
}

function activate(canvas: HTMLCanvasElement): void {
    const currentColor = {'r': '00', 'g': 'c1', 'b': 'ff'}; // modify later to multiple starter gradients

    let animationSpeed = SPEED.REGULAR;
    let levelsAreVisible = false;

    const speedButtons = document.getElementsByName("speed");
    for (const element of speedButtons) {
        const button = element as HTMLInputElement ?? null;
        if (button === undefined || button === null) {throw new Error;}
        button.onclick = () => animationSpeed = changeSpeed(button.value);
    }

    const visibilityButtons = document.getElementsByName("levels");
    for (const element of visibilityButtons) {
        const button = element as HTMLInputElement ?? null;
        if (button === undefined || button === null) {throw new Error;}
        button.onclick = () => {levelsAreVisible = levelsVisibility(button.value); changeOutputVisibility(levelsAreVisible);};
    }

    const resetButton = document.getElementById("reset-button") as HTMLButtonElement ?? null;
    if (resetButton === undefined || resetButton === null) {throw new Error;}
    resetButton.onclick = () => clearCanvas(canvas);

    canvas.addEventListener('click', (async (event: MouseEvent) => {
        userBFS(canvas, event, currentColor, animationSpeed, levelsAreVisible);
    }), {'once': true});
}

function changeOutputVisibility(flag: boolean): void {
    const outputBox = document.getElementById("output-box") as HTMLElement ?? null;
    if (outputBox === undefined || outputBox === null) {throw new Error;}
    outputBox.style.visibility = flag ? "visible" : "hidden";
}

function bfsMain() {
    const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement ?? null;
    if (canvas === undefined || canvas === null) {
        throw new Error;
    }

    // Draw the grid
    for (let i = 0; i < CANVAS_SIZE; i = i + NODE_SIZE) {
        for (let j = 0; j < CANVAS_SIZE; j = j + NODE_SIZE) {
            sketchBox(canvas, i, j, NODE_SIZE, NODE_SIZE, 1, 'black');
        }
    }

    activate(canvas);  
}

bfsMain();
