"use strict";function _classCallCheck(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,o){for(var n=0;n<o.length;n++){var r=o[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _createClass(e,o,n){return o&&_defineProperties(e.prototype,o),n&&_defineProperties(e,n),e}$(function(){var o=new Network("movies-network");d3.json("data/movies_network.json").then(function(e){o.build_network(e)})});var Network=function(){function o(e){_classCallCheck(this,o),self.container=e,self.nodes=[],self.edges=[],sigma.settings.nodesPowRatio=1,sigma.classes.graph.addMethod("neighbors",function(e){var o,n={};for(o in this.allNeighborsIndex[e]||{})n[o]=this.nodesIndex[o];return n})}return _createClass(o,[{key:"process_nodes",value:function(e){e.forEach(function(e){self.nodes.push({id:e.id,label:e.name,x:e.x,y:e.y,size:8,color:e.color})})}},{key:"process_edges",value:function(e){e.forEach(function(e){self.edges.push({id:e.id,source:e.source,target:e.target,type:"curve",color:"rgba(250,250,250,0.6)"})})}},{key:"build_network",value:function(e){this.process_nodes(e.nodes),this.process_edges(e.edges);var e={nodes:self.nodes,edges:self.edges},r=new sigma({autoRescale:!1,graph:e,renderer:{container:document.getElementById(self.container),type:"canvas"},settings:{doubleClickEnabled:!1,minEdgeSize:.5,maxEdgeSize:4,minNodeSize:0,maxNodeSize:0,drawLabels:!1,enableNodeHovering:!1}});r.configNoverlap({nodeMargin:.5,scaleNodes:.85,gridSize:100,easing:"quadraticInOut",duration:1e4}),r.startNoverlap(),r.graph.nodes().forEach(function(e){e.originalColor=e.color}),r.graph.edges().forEach(function(e){e.originalColor=e.color}),r.bind("clickNode",function(e){var o=e.data.node.id,n=r.graph.neighbors(o);n[o]=e.data.node,r.graph.nodes().forEach(function(e){n[e.id]?e.color=e.originalColor:e.color="rgba(190,190,190,0.5)"}),r.graph.edges().forEach(function(e){n[e.source]&&n[e.target]?e.color="rgba(250,250,250,1)":e.color="rgba(170,170,170,0.5)"}),r.refresh()}),r.bind("clickStage",function(e){r.graph.nodes().forEach(function(e){e.color=e.originalColor}),r.graph.edges().forEach(function(e){e.color=e.originalColor}),r.refresh()})}}]),o}();
//# sourceMappingURL=movies_network.js.map
