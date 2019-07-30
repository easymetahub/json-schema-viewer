"use strict";
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {IronResizableBehavior} from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import * as d3 from 'd3';
import {hierarchy, tree} from "d3-hierarchy";
import {flextree} from 'd3-flextree';

/**
 * `json-schema-viewer`
 * Polymer 3 web component for displaying a JSON Schema
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class JsonSchemaViewer extends PolymerElement {
  static get template() {
    return html`
      <style>
      :host {
        display: block;
        height: 100%;
      }
      .general {
        width: 100%;
        height: 95%;
      }
      .general > div {
        padding: 4px;
        margin: 12px;
      }
      .relative {
        @apply --layout-relative;
        @apply --layout-vertical;
      }
      svg {
        border-radius: 25px;
        background-color: var(--easymetahub-d3-graph-background-color, #ddd);
        border: 2px solid var(--easymetahub-d3-graph-border-color, #73AD21);
        padding: 5px;
      }
      svg > g {
        width: 100%;
        height: 100%;
      }
      .node text { 
        font: 12px sans-serif; 
      }

      .nod_selected rect {
        stroke: green;
      }

      .node--internal text {
        text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff;
      }

      .link {
        fill: none;
        stroke: #ccc;
        stroke-width: 2px;
      }
      </style>
    <div class="general">
      <div class="relative" style="height: 100%;">
        <svg height="100%" width="100%" id="polymerTree">
          <defs>
            <filter id="drop-shadow" x="-20%" y="-20%" width="200%" height="200%">
              <feOffset result="offOut" in="SourceAlpha" dx="2" dy="2" />
              <feGaussianBlur result="blurOut" in="offOut" stdDeviation="1" />
              <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
    `;
  }
  static get properties() {
    return {
      orientation: { 
        type: String, 
        notify: true 
      },
      selectedItem: { 
        type: Object, 
        notify: true,
        reflectToAttribute: true 
      },
      treeData: {
        type: Object,
        value: 
            {
                "name": ["Avinash Rao"],
                "size": [ 30, 140 ],
                "children": [
                    {
                        "name": [
                            "Matt Burgess",
                            "Katja Meyer",
                            "John Salter"
                        ],
                        "size": [ 300, 300 ],
                        "children": [
                            {
                                "name": ["Sam Burgess"],
                                "size": [ 30, 140 ]
                            },
                            {
                                "name": ["Katja Meyer"],
                                "size": [ 30, 140 ]
                            },
                            {
                                "name": ["John Salter"],
                                "size": [ 30, 140 ]
                            },
                            {
                                "name": ["Tony Camps"],
                                "size": [ 30, 140 ]
                            }
                        ]
                    },
                    {
                        "name": ["Matt Coyle"],
                        "size": [ 30, 140 ],
                        "children": [
                            {
                                "name": ["Katja Meyer"],
                                "size": [ 30, 140 ]
                            },
                            {
                                "name": ["John Salter"],
                                "size": [ 30, 140 ]
                            },
                            {
                                "name": ["Tony Camps"],
                                "size": [ 30, 140 ]
                            }
                        ]
                    },
                    {
                        "name": ["Uros Rapajic"],
                        "size": [ 30, 140 ],
                        "children": [
                            {
                                "name": ["Matti John"],
                                "size": [ 30, 140 ]
                            },
                            {
                                "name": ["Tom Robinson"],
                                "size": [ 30, 140 ],
                                "children": [
                                    {
                                        "name": ["Matti John"],
                                        "size": [ 30, 140 ]
                                    },
                                    {
                                        "name": ["Tom Robinson"],
                                        "size": [ 30, 140 ]
                                    },
                                    {
                                        "name": ["Victor Sanchez"],
                                        "size": [ 30, 140 ]
                                    }
                                ]
                            },
                            {
                                "name": ["Victor Sanchez"],
                                "size": [ 30, 140 ],
                                "children": [
                                    {
                                        "name": ["Matti John"],
                                        "size": [ 30, 140 ]
                                    },
                                    {
                                        "name": ["Tom Robinson"],
                                        "size": [ 30, 140 ]
                                    },
                                    {
                                        "name": ["Victor Sanchez"],
                                        "size": [ 30, 140 ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "name": ["Renaud Lambiotte"],
                        "size": [ 30, 140 ],
                        "children": [
                            {
                                "name": ["Matti John"],
                                "size": [ 30, 140 ]
                            },
                            {
                                "name": ["Tom Robinson"],
                                "size": [ 30, 140 ]
                            },
                            {
                                "name": ["Victor Sanchez"],
                                "size": [ 30, 140 ]
                            }
                        ]
                    }
                ]
            }
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('iron-resize', this.onIronResize.bind(this));
    let svg = this.$.polymerTree;
    let aa = svg.getBoundingClientRect();
    let svg_height = aa.height;
    let svg_width = aa.width;

    this.treemap = flextree().spacing(15);
    this.root = this.treemap.hierarchy(this.treeData, function(d) { return d.children; });
    this.root.x0 = svg_width / 2;
    this.root.y0 = 0;

    this.zoomContainer = d3.select(this.$.polymerTree)
      .call(d3.zoom()
        .scaleExtent([.5, 10])
        .on("zoom", () => {
          this.zoomContainer.attr("transform", d3.event.transform)
        }))
      .on("dblclick.zoom", null)
      .append('g');

    console.log(this.localName + '#' + this.id + ' has local DOM initialized');

    this.update(this.root);
    this.centerNode(this.root);
  }

  onIronResize() {
    this.width = this.offsetWidth;
    this.height = this.offsetHeight;
  }

  collapse(d) {
    if(d.children) {
      d._children = d.children
      d._children.forEach(collapse)
      d.children = null
    }
  }

    dblclick(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        this.update(d);
        this.centerNode(d);
    }

    click(d, i, p) {
        for (let nodeIndex = 0 ; nodeIndex < p.length; nodeIndex++) {
            let cnode = p[nodeIndex];

            if (hasClass(cnode, "node_selected")) {
                cnode.style.filter = null;
                removeClass(cnode, "node_selected");
            }
        }

        if (d == this.selectedItem) {
            this.set("selectedItem", null);
        } else {
            this.set("selectedItem", d); 
            p[i].style.filter = "url(#drop-shadow)";
            addClass(p[i], "node_selected");
        }
        this.notifyPath("selectedItem");
    }

    centerNode(source) {
        let aa = this.$.polymerTree.getBoundingClientRect();
        let svg_height = aa.height - 20 - 30;
        let svg_width = aa.width - 90 - 90;
        
        let t = d3.zoomTransform(this.$.polymerTree);
        
        /*
        To keep the node to be centered at the same x coordinate use
        x = t.x;
        
        To position the node at a certain x coordinate, use
        x =  source.y0;
        x = -x *t.k + 50;
        
        */
        let x =  source.y0;
        x = -x *t.k + svg_width / 3;
        
        let y = source.x0;
        
        y = -y *t.k + svg_height / 2;
        
        this.zoomContainer.transition()
        .duration(750)
        .attr("transform", "translate(" + x + "," + y + ")scale(" + t.k + ")");
//        .on("end", function(){ this.zoomContainer.call(this.zoomListener.transform, d3.zoomIdentity.translate(x,y).scale(t.k))});
    }


  update(source) {
    this.treeData2 = this.treemap(this.root);

    // ****************** Nodes section ***************************
    let i = 0;

    // Update the nodes...
    let node = this.zoomContainer.selectAll('g.node')
    .data(this.root.nodes, function(d) {return d.id || (d.id = ++i); });
    
    // Enter any new modes at the parent's previous position.
    let nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('id', function(d) { return d.id; } )
    .attr("transform", function(d) {
    return "translate(" + source.y0 + ", " + source.x0 + ")";
    })
    .on('click', (d, i, p) => this.click(d, i, p))
    .on('dblclick', (d) => this.dblclick(d));
    
    
    // Add Rectangles for the nodes
    nodeEnter.append('rect')
    .attr('class', 'node')
    .attr("width",function (d) {return d.data.size[1] - 40; })
    .attr("height",function (d) {return d.data.size[0]; })
    //.attr("height", 30)
    .attr("y", function (d) {return -(d.data.size[0]) / 2; })
    .attr("x", 0)
    .attr("fill", "#ddd")
    .attr("stroke", "#000");
    
    
    // Add labels for the nodes
    nodeEnter.append('text')
    .attr("x", 20)
    .attr("y", function (d) {return -(d.data.size[0]) / 2; })
    .style("text-anchor", "start")
    .style("font-size", "7pt")
    .each(function (d) {
      let j = 0
      while (d.data.name[j]) {
        d3.select(this).append("tspan")
        .text(d.data.name[j])
        .attr("dy", "1.4em")
        .on('dblclick', null)
        .attr("x", "10")
        j++;
      }
    });

    // UPDATE
    const nodeUpdate = nodeEnter.merge(node);
    // Transition to the proper position for the node
    nodeUpdate.transition()
    .duration(750)
    .attr("transform", function(d) { 
      return "translate(" + d.y + "," + d.x + ")";
    });

    let nodeExit = node.exit().transition()
    .duration(750)
    .attr("transform", function(d) {
      return "translate(" + source.y + " , " + source.x + ")";
    })
    .remove();

    // ****************** links section ***************************
    
    // Update the links...
    let link = this.zoomContainer.selectAll('path.link')
    .data(this.root.nodes.slice(1), function(d) { return d.id; });
    
    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
    .attr("class", "link")
    .attr('d', function(d){
      var o = {x: source.x0, y: source.y0}
      return diagonal(o, o)
    });
    
    // UPDATE
    var linkUpdate = linkEnter.merge(link);
    
    // Transition back to the parent element position
    linkUpdate.transition()
    .duration(750)
    .attr('d', function(d){ return diagonal(d.parent, d) });

    // Remove any exiting links
    let linkExit = link.exit().transition()
    .duration(750)
    .attr('d', function(d) {
      var o = {x: source.x, y: source.y}
      return diagonal(o, o)
    })
    .remove();

    // Store the old positions for transition.
    this.root.nodes.forEach(function(d){
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a non-curved path from parent to the child nodes
    function diagonal(s, d) {
        let start = s.y;
        let midpoint = d.y - 20;
        
        if (d.data) {
            start += s.data.size[1] - 40;
            midpoint = d.y  - 20;
        }
        return 'M' + start + ',' + s.x + 'H' + midpoint + 'V' + d.x + 'H' + d.y + 'h1';
    }
  }
  
}

window.customElements.define('json-schema-viewer', JsonSchemaViewer);
