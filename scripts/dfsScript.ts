// // DFS
// function DFS(start: number, adjacencies: Map<number, Array<number>>): Map<number, Array<number>> {
//     // defensively copy
//     const adjacencyList = new Map<number, Array<number>>();
//     for (const node of adjacencies.keys()) {
//         const copiedNeighbors = [];
//         for (const neighbor of adjacencies.get(node)) {
//             copiedNeighbors.push(neighbor);
//         }
//         adjacencyList.set(node, copiedNeighbors);
//     }

//     // keep track of already visited nodes
//     const visited: Set<number> = new Set([start]);
//     const stack: Array<number> = [start];

//     // build level sets
//     let currentLevel = 0;
//     const levelsToNodes = new Map<number, Array<number>>();
//     levelsToNodes.set(0, [start]);
//     const nodesToLevels = new Map<number, number>();
//     nodesToLevels.set(start, 0);

//     while (stack.length > 0) {
//         const currentNode = stack.pop();
//         if (nodesToLevels.get(currentNode) > currentLevel) {
//             currentLevel++;
//         }
//         const neighbors = adjacencyList.get(currentNode);
//         for (const neighbor of neighbors) {
//             if (!visited.has(neighbor)) {
//                 visited.add(neighbor);
//                 stack.push(neighbor);
//                 if (levelsToNodes.get(currentLevel + 1) !== undefined) {
//                     levelsToNodes.get(currentLevel + 1).push(neighbor);
//                 }

//                 else {
//                     levelsToNodes.set(currentLevel + 1, [neighbor]);
//                 }
//                 nodesToLevels.set(neighbor, currentLevel + 1);
//             }
//         }
//     }

//     return levelsToNodes;
// }
