$(function() {
	const net = new Network("movies-network")
	d3.json("data/movies_network.json").then(data => {
		net.build_network(data)
	});
})

/**
 * Builds a network plot in the given container id
 */
class Network {
	constructor(container) {
		self.container = container;
		self.nodes = [];
		self.edges = [];

        sigma.settings.nodesPowRatio = 1;
		sigma.classes.graph.addMethod('neighbors', function(nodeId) {
			var k,
				neighbors = {},
				index = this.allNeighborsIndex[nodeId] || {};
		
			for (k in index)
			  neighbors[k] = this.nodesIndex[k];
		
			return neighbors;
		  });
	}

	// Processes node data 
	process_nodes(nodes) {
		var audio_to_color = {
			'English': "#DB0000",
			'Japanese': "#CE060B", 
			'Hindi': "#623A63",
			'French': "#B31321",
			'Korean': "#A51A2C",
			'Italian': "#6F3458",
			'German': "#8A2742", 
			'Spanish': "#7D2D4D",
			'Mandarin': "#982037", 
			'Arabic': "#C00D16",
		}
		nodes.forEach(node => {
			self.nodes.push({
				id: node.id, 
				label: `${node.name} (${node.audio})`,
				x: node.x,
				y: node.y, 
				size: 8,
				color: audio_to_color[node.audio]
			})
		});
	}

	// Processes edge data
	process_edges(edges) {
		edges.forEach(edge => {
			self.edges.push({
				id: edge.id, 
				source: edge.source,
				target: edge.target,
				type: 'curve',
				color: 'rgba(250,250,250,0.6)'
			})
		});
	}

	build_network(data) {
		this.process_nodes(data.nodes);
		this.process_edges(data.edges);
		let g = {nodes: self.nodes, edges: self.edges};
		// Build initial graph
		let s = new sigma({
			autoRescale : false,
			graph: g,
			renderer: {
				container: document.getElementById(self.container),
				type: 'canvas'
			},
			settings: {
				doubleClickEnabled: false,
				minEdgeSize: 0.5,
				maxEdgeSize: 4,
				minNodeSize: 0,
				maxNodeSize: 0,
				drawLabels: false,
				enableNodeHovering: false,
			}
		})

		// Plugin to avoid nodes overlapping 
		s.configNoverlap({
			nodeMargin: 0.8,
			scaleNodes: 0.85,
			gridSize: 100,
			easing: 'quadraticInOut', // animation transition function
			duration: 10000   // animation duration. Long here for the purposes of this example only
		  });

		// Start the layout:
		s.startNoverlap();


		s.graph.nodes().forEach(function(n) {
			n.originalColor = n.color;
		  });
		s.graph.edges().forEach(function(e) {
			e.originalColor = e.color;
		});

		// Select nodes and neighbors when selecting a node
		s.bind('clickNode', e => {
			var nodeId = e.data.node.id;
			var toKeep = s.graph.neighbors(nodeId);
			toKeep[nodeId] = e.data.node;

			s.graph.nodes().forEach(n => {
				if (toKeep[n.id]) {
					n.color = n.originalColor;
				} else {
					n.color = 'rgba(190,190,190,0.5)';
				}
			});

			s.graph.edges().forEach(e => {
				if (toKeep[e.source] && toKeep[e.target]) {
					e.color = 'rgba(250,250,250,1)';
				} else {
					e.color = 'rgba(170,170,170,0.5)';
				}
			});
			s.refresh();
		});

		// Restore original colors after deselection
		s.bind('clickStage', function(e) {
			s.graph.nodes().forEach(function(n) {
			  n.color = n.originalColor;
			});
	
			s.graph.edges().forEach(function(e) {
			  e.color = e.originalColor;
			});
	
			s.refresh();
		});

	}
} 