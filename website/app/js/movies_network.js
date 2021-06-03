$(function() {
	const net = new Network("movies-network")
	d3.json("data/movies_network.json").then(data => {
		net.build_network(data)
	});
})

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

	process_nodes(nodes) {
		nodes.forEach(node => {
			self.nodes.push({
				id: node.id, 
				label: node.name,
				x: node.x,
				y: node.y, 
				size: 8,
				color: node.color//getHexColor(2**node.audio)
			})
		});
	}

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

		s.configNoverlap({
			nodeMargin: 0.5,
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

			// Since the data has been modified, we need to
			// call the refresh method to make the colors
			// update effective.
			s.refresh();
		});

		s.bind('clickStage', function(e) {
			s.graph.nodes().forEach(function(n) {
			  n.color = n.originalColor;
			});
	
			s.graph.edges().forEach(function(e) {
			  e.color = e.originalColor;
			});
	
			// Same as in the previous event:
			s.refresh();
		});

	}
} 