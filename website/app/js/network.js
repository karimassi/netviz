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
	}

	process_nodes(nodes) {
		nodes.forEach(node => {
			self.nodes.push({
				id: node.id, 
				// label: node.name,
				x: node.x,
				y: node.y, 
				size: 0.1,
				color: "#ff0000"//getHexColor(2**node.audio)
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
				color: '#eee'
			})
		});
	}

	build_network(data) {
		this.process_nodes(data.nodes);
		this.process_edges(data.edges);
		let g = {nodes: self.nodes, edges: self.edges};

		let s = new sigma({
			graph: g,
			renderer: {
				container: document.getElementById(self.container),
				type: 'canvas'
			},
			settings: {
				doubleClickEnabled: false,
				minEdgeSize: 0.5,
				maxEdgeSize: 4,
				enableEdgeHovering: true,
				edgeHoverColor: 'edge',
				defaultEdgeHoverColor: '#000',
				edgeHoverSizeRatio: 1,
				edgeHoverExtremities: true,
			}
		})
	}
} 

function getHexColor(number){
	return "#"+((number)>>>0).toString(16).slice(-6);
}