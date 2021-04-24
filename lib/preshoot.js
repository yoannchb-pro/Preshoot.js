window.preshootConfig = {
    debug: false,
    detectWithArea: false,
    mouseInterval: 23,
    maxDistance: 100,
    reset: true,
    onError: (el, msg) => {
        console.warn("Error during executing function ", {
            error: true,
            element: el,
            message: msg
        });
    }
}

window.addEventListener('load', function() {
    const preshoot = document.querySelectorAll('[preshoot-area]');

    let mouseLoopCount = 0;

    const lastMouse = {
        x: false,
        y: false
    }

    function distance(x, y, xx, yy) {
        const calcX = Math.pow(x - xx, 2);
        const calcY = Math.pow(y - yy, 2);
        return Math.sqrt(calcX + calcY);
    }

    function intersects(a, b, c, d, p, q, r, s) {
        var det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
            return false;
        } else {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    };

    function initPreshoot(event) {
        //agrandi la marge de calcule
        mouseLoopCount++;
        if (mouseLoopCount < window.preshootConfig.mouseInterval) return;
        else mouseLoopCount = 0;

        const touch = event.type == 'touchmove' ? (event.touches[0] || event.changedTouches[0]) : false;
        const x = event.clientX || touch.clientX;
        const y = event.clientY || touch.clientY;

        let min = false;
        let minElement = null;
        let minDist = null;
        let calcLine = false;

        preshoot.forEach((element, index) => {
            const objY = element.offsetTop + (element.offsetHeight / 2);
            const objX = element.offsetLeft + (element.offsetWidth / 2);
            //const radius = ((element.offsetHeight / 2) + (element.offsetWidth / 2)) / 2;
            const dist = distance(x, y, objX, objY);

            //Detect line intersection
            if (lastMouse['x'] && lastMouse['y']) {
                const diffX = x - lastMouse['x'];
                const diffY = y - lastMouse['y'];

                const coeff = diffY / diffX;

                const supp = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;

                const x2 = supp * diffX;
                const y2 = coeff * x2;

                let cond = false;
                if ((diffX > 0 && diffY > 0) || (diffX < 0 && diffY < 0)) cond = intersects(x, y, x2, y2,
                    element.offsetLeft + element.offsetWidth, element.offsetTop, element.offsetLeft, element.offsetTop + element.offsetHeight);

                if ((diffX > 0 && diffY < 0) || (diffX < 0 && diffY > 0)) cond = intersects(x, y, x2, y2,
                    element.offsetLeft, element.offsetTop, element.offsetLeft + element.offsetWidth, element.offsetTop + element.offsetHeight)


                if (window.preshootConfig.debug) {
                    let svg = document.querySelector('#debug-preshoot');

                    if (!svg) {
                        const debugEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');

                        debugEl.id = "debug-preshoot";
                        debugEl.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none";

                        l.setAttribute("stroke", "rgb(0, 0, 0)");
                        l.setAttribute("opacity", "0.4");
                        l.setAttribute("stroke-width", "2");
                        l.setAttribute("x1", "0");
                        l.setAttribute("x2", "0");
                        l.setAttribute("y1", "0");
                        l.setAttribute("y2", "0");

                        debugEl.appendChild(l);

                        document.body.appendChild(debugEl);
                    }

                    svg = document.querySelector('#debug-preshoot');
                    const line = svg.querySelector('line');

                    line.x1.baseVal.value = x;
                    line.y1.baseVal.value = y;
                    line.x2.baseVal.value = x2;
                    line.y2.baseVal.value = y2;
                }

                if (cond) {
                    if (calcLine && (!min || min > dist)) {
                        min = dist;
                        minDist = dist;
                        calcLine = true;
                        minElement = element;
                    } else if (!calcLine) {
                        min = dist;
                        minDist = dist;
                        calcLine = true;
                        minElement = element;
                    }
                }
            }

            //Detect by area distance
            if (window.preshootConfig.detectWithArea && !calcLine && (!min || min > dist)) {
                minDist = dist;
                min = dist;
                minElement = element;
            }
        });

        //modify element
        if (minElement) {
            const fn = minElement.getAttribute('preshoot-area');

            const moyEcran = (window.innerWidth + window.innerHeight) / 2;
            const prc = (minDist / moyEcran) * 100;

            if (prc > window.preshootConfig.maxDistance) return;

            if (fn) {
                try {
                    window[fn]({
                        element: minElement,
                        distance: minDist,
                        pourcentage: prc
                    });
                } catch (e) {
                    window.preshootConfig.onError(minElement, e);
                }
            }

            const className = minElement.getAttribute('preshoot-area-class');

            minElement.classList.add(className || "preshoot");

            preshoot.forEach((element, index) => {
                const className = element.getAttribute('preshoot-area-class');
                if (element != minElement) element.classList.remove(className || "preshoot");
            });
        } else if (window.preshootConfig.reset) {
            preshoot.forEach((element, index) => {
                const className = element.getAttribute('preshoot-area-class');
                element.classList.remove(className || "preshoot");
            });
        }
        //end

        lastMouse['x'] = x;
        lastMouse['y'] = y;
    }

    window.addEventListener('mousemove', initPreshoot);
    window.addEventListener('touchmove', initPreshoot);
});
