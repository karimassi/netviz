"use strict";function _classCallCheck(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,n){for(var o=0;o<n.length;o++){var r=n[o];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _createClass(e,n,o){return n&&_defineProperties(e.prototype,n),o&&_defineProperties(e,o),e}$(function(){var n=new Network("movies-network");d3.json("data/movies_network.json").then(function(e){n.build_network(e)})});var Network=function(){function n(e){_classCallCheck(this,n),self.container=e,self.nodes=[],self.edges=[]}return _createClass(n,[{key:"process_nodes",value:function(e){e.forEach(function(e){self.nodes.push({id:e.id,x:e.x,y:e.y,size:.1,color:"#ff0000"})})}},{key:"process_edges",value:function(e){e.forEach(function(e){self.edges.push({id:e.id,source:e.source,target:e.target,type:"curve",color:"#eee"})})}},{key:"build_network",value:function(e){this.process_nodes(e.nodes),this.process_edges(e.edges);e={nodes:self.nodes,edges:self.edges},new sigma({graph:e,renderer:{container:document.getElementById(self.container),type:"canvas"},settings:{doubleClickEnabled:!1,minEdgeSize:.5,maxEdgeSize:4,enableEdgeHovering:!0,edgeHoverColor:"edge",defaultEdgeHoverColor:"#000",edgeHoverSizeRatio:1,edgeHoverExtremities:!0}})}}]),n}();function getHexColor(e){return"#"+(e>>>0).toString(16).slice(-6)}
//# sourceMappingURL=network.js.map
