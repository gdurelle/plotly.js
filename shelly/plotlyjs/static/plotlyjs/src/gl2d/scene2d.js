'use strict';

var createPlot2D = require('gl-plot2d');
var createOptions = require('./convert/axes2dgl');

function Scene2D(options, fullLayout) {

    console.log('Instantiating Scene2d', options);

    var container = this.container = options.container;

    var width       = fullLayout.width;
    var height      = fullLayout.height;

    //Get pixel ratio
    var pixelRatio = this.pixelRatio = options.pixelRatio || window.devicePixelRatio;

    //Create canvas and append to container
    var canvas = this.canvas = document.createElement('canvas');
    canvas.width        = Math.ceil(pixelRatio * width) |0;
    canvas.height       = Math.ceil(pixelRatio * height)|0;
    canvas.style.width  = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top    = '0px';
    canvas.style.left   = '0px';
    canvas.style['z-index'] = '100';

    //Get webgl context
    var gl;
    try {
      gl = canvas.getContext('webgl', options.glOptions);
    } catch(e) {}
    if(!gl) {
      try {
        gl = canvas.getContext('experimental-webgl', options.glOptions);
      } catch(e) {}
    }
    if(!gl) {
      throw new Error('webgl not supported!');
    }
    this.gl = gl;

    //Append canvas to conatiner
    container.appendChild(canvas);

    //Update options
    this.glplotOptions = createOptions(this);
    this.glplotOptions.merge(fullLayout);

    //Create the plot
    this.glplot = createPlot2D(this.glplotOptions);

    //Redraw the plot
    this.redraw = this.draw.bind(this);
    this.redraw();
}

module.exports = Scene2D;

var proto = Scene2D.prototype;

proto.computeTickMarks = function() {
  return [[], []];
};

proto.plot = function(fullData, fullLayout) {
    //Check for resize
    var glplot     = this.glplot;
    var pixelRatio = this.pixelRatio;

    var width       = fullLayout.width;
    var height      = fullLayout.height;
    var pixelWidth  = Math.ceil(pixelRatio * width) |0;
    var pixelHeight = Math.ceil(pixelRatio * height)|0;

    var canvas = this.canvas;
    if(canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width        = pixelWidth;
      canvas.height       = pixelHeight;
    }

    //Update plot
    var options       = this.glplotOptions;
    options.merge(fullLayout);
    options.screenBox = [0,0,width,height];
    options.viewBox   = [0.125*width,0.125*height,0.875*width,0.875*height];
    options.ticks     = this.computeTickMarks();

    glplot.update(options);
};

proto.draw = function() {
    requestAnimationFrame(this.redraw);

    //Check for resize
    var glplot = this.glplot;

    //Draw plot
    glplot.draw();
};
