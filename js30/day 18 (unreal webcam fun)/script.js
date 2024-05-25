const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
        console.log(localMediaStream);
        video.srcObject = localMediaStream; // Updated for newer browser compatibility
        video.play();
    })
    .catch(err => {
        console.error('oh no!', err);
    });
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        // Take the pixels
        let pixels = ctx.getImageData(0, 0, width, height);
        // Mess with them
        // pixels = redEffect(pixels);

        // pixels = rgbSplit(pixels);
        // ctx.globalAlpha = 0.8;

        pixels = greenScreen(pixels);
        // Put them back
        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

function takePhoto() {
    // Played sound
    snap.currentTime = 0;
    snap.play();

    // Take the data out of canvas 
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'handsome');
    link.innerHTML = `<img src="${data}" alt="handsome man"/>`;
    strip.insertBefore(link, strip.firstChild); // Corrected typo in insertBefore method
}

function redEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 200; // Red
        pixels.data[i + 1] = pixels.data[i + 1] - 50;  // Green
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
    }
    return pixels;
}

function greenScreen(pixels) {
    const levels = {};
    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = parseInt(input.value); // Parse the value to ensure it's treated as a number
    });

    for (let i = 0; i < pixels.data.length; i += 4) {
        const red = pixels.data[i + 0];
        const green = pixels.data[i + 1];
        const blue = pixels.data[i + 2];
        const alpha = pixels.data[i + 3];

        if (red >= levels.rmin &&
            green >= levels.gmin &&
            blue >= levels.bmin &&
            red <= levels.rmax &&
            green <= levels.gmax &&
            blue <= levels.bmax) {
            pixels.data[i + 3] = 0;
        }
    }
    return pixels;
}


getVideo();
video.addEventListener('canplay', paintToCanvas); // Corrected event listener
