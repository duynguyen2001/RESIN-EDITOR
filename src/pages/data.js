export const data = {
    nodes: [
    { id: 'root', childrenNode: ['node1', 'node2', 'node3'], outlinks: [] },
    { id: 'node1', childrenNode: ['node1-1', 'node1-2'], outlinks: ['node2'] },
    { id: 'node1-1', childrenNode: ['node1-1-1'], outlinks: ['node1-2'] },
    { id: 'node1-1-1', childrenNode: [], outlinks: [] },
    { id: 'node1-2', childrenNode: [], outlinks: [] },
    { id: 'node2', childrenNode: ['node2-1', 'node2-2', 'node2-3'], outlinks: ['node3'] },
    { id: 'node2-1', childrenNode: [], outlinks: [] },
    { id: 'node2-2', childrenNode: [], outlinks: ['node2-3', 'node2-1'] },
    { id: 'node2-3', childrenNode: [], outlinks: [] },
    { id: 'node3', childrenNode: ['node3-1', 'node3-2'], outlinks: [] },
    { id: 'node3-1', childrenNode: [], outlinks: ['node3-2'] },
    { id: 'node3-2', childrenNode: [], outlinks: [] },
  ]
  };