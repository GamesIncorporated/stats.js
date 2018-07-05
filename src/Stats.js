var Stats = function() {
    var container = document.createElement("div");
    container.style.cssText = "position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
    // container.addEventListener(
    //     "click",
    //     function(event) {
    //         event.preventDefault();
    //         showPanel(++mode % container.children.length);
    //     },
    //     false
    // );

    //

    function addPanel(panel) {
        container.appendChild(panel.dom);
        return panel;
    }

    function showPanel(ids = [0]) {
        for (var i = 0; i < container.children.length; i++) {
            container.children[i].style.display = ids.indexOf(i) >= 0 ? "block" : "none";
        }

        // mode = id;
    }

    //

    var beginTime = (performance || Date).now(),
        prevTime = beginTime,
        frames = 0;

    var fpsPanel = addPanel(new Stats.Panel("FPS", "#0ff", "#002"));
    var msPanel = addPanel(new Stats.Panel("MS", "#0f0", "#020"));

    if (self.performance && self.performance.memory) {
        var memPanel = addPanel(new Stats.Panel("MB", "#f08", "#201"));
    }

    var objectsPanel = addPanel(new Stats.Panel("#Objects", "#fd5f00", "#4b1c00"));

    var eventsPanel = addPanel(new Stats.Panel("#Events", "#ccff00", "#283300"));

    var eventCallsPanel = addPanel(new Stats.Panel("#EventCalls", "#ea0034", "#2e000a"));

    showPanel([0, 1, 2, 3, 4, 5]);

    return {
        REVISION: 16,

        dom: container,

        addPanel: addPanel,
        showPanel: showPanel,

        begin: function() {
            beginTime = (performance || Date).now();
        },

        end: function({ callbacksMade = 0, eventsProcessed = 0, objectCount = 0 } = {}) {
            frames++;

            var time = (performance || Date).now();

            msPanel.update(time - beginTime, 100);

            if (time >= prevTime + 1000) {
                fpsPanel.update((frames * 1000) / (time - prevTime), 100);

                prevTime = time;
                frames = 0;

                if (memPanel) {
                    var memory = performance.memory;
                    memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
                }
            }
            objectsPanel.update(objectCount, 2000);
            eventsPanel.update(eventsProcessed, 10);
            eventCallsPanel.update(callbacksMade, 5000);

            return time;
        },

        update: function() {
            beginTime = this.end();
        },

        // Backwards Compatibility

        domElement: container
        // setMode: showPanel
    };
};

Stats.Panel = function(name, fg, bg) {
    var min = Infinity,
        max = 0,
        round = Math.round;
    var PR = round(window.devicePixelRatio || 1);

    var WIDTH = 130 * PR,
        HEIGHT = 55 * PR,
        TEXT_X = 3 * PR,
        TEXT_Y = 2 * PR,
        GRAPH_X = 3 * PR,
        GRAPH_Y = 20 * PR,
        GRAPH_WIDTH = 124 * PR,
        GRAPH_HEIGHT = 38 * PR;

    var canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = "width:130px;height:55px";

    var context = canvas.getContext("2d");
    context.font = "bold " + 10 * PR + "px Helvetica,Arial,sans-serif";
    context.textBaseline = "top";

    context.fillStyle = bg;
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = fg;
    context.fillText(name, TEXT_X, TEXT_Y);
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    return {
        dom: canvas,

        update: function(value, maxValue) {
            min = Math.min(min, value);
            max = Math.max(max, value);

            context.fillStyle = bg;
            context.globalAlpha = 1;
            context.fillRect(0, 0, WIDTH, GRAPH_Y);
            context.fillStyle = fg;
            context.fillText(round(value) + " " + name + " (" + round(min) + "-" + round(max) + ")", TEXT_X, TEXT_Y);

            context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);

            context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

            context.fillStyle = bg;
            context.globalAlpha = 0.9;
            context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - value / maxValue) * GRAPH_HEIGHT));
        }
    };
};

export { Stats as default };
