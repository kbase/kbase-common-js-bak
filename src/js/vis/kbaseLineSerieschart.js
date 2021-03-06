/*

 */

define(
    [
        'jquery',
        'd3',
        'kb_vis_linechart',
        'kb_vis_RGBColor',
        'kb_vis_rectangle',
        'kb_vis_point',
        'kb_vis_size',
    ], function ($) {


    'use strict';

    $.KBWidget({

	    name: "kbaseLineSerieschart",
	  parent: "kbaseLinechart",

        version: "1.0.0",
        options: {

        },

        _accessors : [
            'labels',
        ],

        xTickValues : function() {

            var $ls = this;

            var m = d3.merge(
                this.dataset().map( function(d) {
                    return d.values.map(function(l) { return l.x })
                } )
            );

            m = d3.set(m).values();

            return m;
        },

        xTickLabel : function(val) {
            if (this.labels() != undefined) {
                return this.labels()[val];
            }
            else {
                return val;
            }
        },
    });

});
