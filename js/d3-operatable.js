
var makeRightDblClickHandler = function(handler, mousedownHandler) {
    var INTERVAL_FOR_DBLCLICK = 300; //two clicks in this period will be recognized as "double click"
    var timeout = 0;
    var clicked = false;
    return function() {
        if (d3.event.button === 0) {
            if(mousedownHandler) mousedownHandler();
            return;
        }
        if (d3.event.button !== 2)
            return;
        d3.event.preventDefault();
        if (clicked) {
            clearTimeout(timeout);
            clicked = false;
            handler.apply(this, arguments);
        } else {
            clicked = true;
            timeout = setTimeout(function() {
                clicked = false;
            }, INTERVAL_FOR_DBLCLICK);
        }
    };
};

//shuold be called after "mousedown" event setting
d3.selection.prototype.rightdblclick = function(rightdblclickHandler) {
// the other way for event handling
// var dispatch = d3.dispatch("rightdblclick");
// d3.rebind(this, dispatch, "on");
// this.on("rightdblclick", function(){});
// dispatch.rightdblclick();//fire event!
    this.on("mousedown", makeRightDblClickHandler(rightdblclickHandler, this.on("mousedown")));
    return this;
};

d3.selection.prototype.operatable = function(doBefore, doAfter) {
    
    var ANIMATION_DURATION = 500;
    var self = this; //should be d3 element of "svg" dom element
    
    //prevent context menu showing for right click operation
    self[0][0].oncontextmenu = function(){return false;};

    doBefore = doBefore || function() {};
    //add delay for animation effect of operation
    doAfter = doAfter ? function() {setTimeout(doAfter, ANIMATION_DURATION + 100);} : function() {};

    var prop = self.attr("viewBox").split(" ").map(Number);
    var base_w = prop[2];
    var base_h = prop[3];

    var onDrag = false;

    var changeScale = function(scale, prev_mouse, immediate) {
        var prop = self.attr("viewBox").split(" ").map(Number);

        //if not mouse click, magnify/shrink center is the center coordinate of current viewbox
        if (!prev_mouse) {
            var prev_mouse = [prop[0] + prop[2] / 2, prop[1] + prop[3] / 2];
        }
        var dest_w = base_w * scale;
        var dest_h = base_h * scale;

        prop[0] = prop[0] + (prev_mouse[0] - prop[0]) * (1 - dest_w / prop[2]);
        prop[1] = prop[1] + (prev_mouse[1] - prop[1]) * (1 - dest_h / prop[3]);
        prop[2] = dest_w;
        prop[3] = dest_h;
        
        var dest_cond = {viewBox : prop.map(Math.round).join(" ")};
        if (immediate) {
            self.attr(dest_cond);
        } else {
            self.transition().duration(ANIMATION_DURATION).attr(dest_cond);
        }
        //radiating circle as visual effect
        self.append("circle").attr(
                {cx: prev_mouse[0], cy: prev_mouse[1], r: 0, "fill-opacity": 1, fill: "black", stroke: "black"})
                .transition().duration(ANIMATION_DURATION).attr({r: 50 * scale, "fill-opacity": 0}).remove();
    };

    var zoom = d3.behavior.zoom().on("zoom", function(d) {
        if (onDrag) return;
        doBefore();
        changeScale(1 / d3.event.scale, d3.mouse(this), d3.event.sourceEvent.type == "wheel");
        doAfter();
    });
    self.call(zoom);

    var move = function(dx, dy) {
        var prop = self.attr("viewBox").split(" ").map(Number);
        prop[0] = prop[0] - dx / zoom.scale();
        prop[1] = prop[1] - dy / zoom.scale();
        self.attr("viewBox", prop.join(" "));
    };

    var drag = d3.behavior.drag().on("drag", function() {
        move(d3.event.dx, d3.event.dy);
    }).on("dragstart", function() {
        doBefore();
        onDrag = true;
    }).on("dragend", function() {
        doAfter();
        onDrag = false;
    });
    self.call(drag);

    self.rightdblclick(function() {
        var mouse = d3.mouse(self[0][0]); //[0][0] indicates a dom element corresponding to d3 selection 
        zoom.scale(zoom.scale() / 2);
        changeScale(1 / zoom.scale(), mouse);
    });

    return this;
};


