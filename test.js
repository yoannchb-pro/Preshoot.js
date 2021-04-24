window.addEventListener('load', function() {
    const debugBtn = document.querySelector('#debug');
    const areaBtn = document.querySelector('#area');
    const intervalBtn = document.querySelector('#interval');
    const distanceBtn = document.querySelector('#distance');
    const resetBtn = document.querySelector('#reset');

    debugBtn.addEventListener('change', function(event) {
        window.preshootConfig.debug = debugBtn.checked
    });

    resetBtn.addEventListener('change', function(event) {
        window.preshootConfig.reset = resetBtn.checked
    });

    areaBtn.addEventListener('change', function(event) {
        window.preshootConfig.detectWithArea = areaBtn.checked
    });

    intervalBtn.addEventListener('change', function(event) {
        window.preshootConfig.mouseInterval = intervalBtn.value;
    });

    distanceBtn.addEventListener('change', function(event) {
        window.preshootConfig.maxDistance = intervalBtn.value;
    });
});