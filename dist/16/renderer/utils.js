const log = console.log.bind(console)

const _e = (sel) => document.querySelector(sel)

const interpolate = (a, b, factor) => a + (b - a) * factor

const ajax = request => {
    let r = new XMLHttpRequest();
    r.open("GET", request.url, true);
    // r.responseType = "arraybuffer";
    r.onreadystatechange = event => {
        if (r.readyState == 4) {
            request.callback(r.response);
        }
    };
    r.send();
};