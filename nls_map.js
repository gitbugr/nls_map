async function draw(image_id) {

    let canvas = document.getElementById('c');
    let context = c.getContext('2d');

    let image_code = createImageCodeFromID(image_id);
    let info = await getImageInfo(image_code);

    let max_image_width = info.width;
    let max_image_height = info.height;

    let image_width = image_height = 512;

    canvas.width = max_image_width;
    canvas.height = max_image_height;

    product([...Array(Math.ceil(max_image_width / image_width)).keys()], [...Array(Math.ceil(max_image_height / image_height)).keys()])
        .map(([x_index,y_index]) => [x_index * image_width, y_index * image_height])
        .forEach(([x,y]) => {
            getBase64Image(`https://mapview.nls.uk/iiif/${image_code}/${x},${y},${image_width},${image_height}/pct:100/0/native.jpg`)
                .then(value => {
                    let img = new Image();
                    img.src = value;
                    img.onload = () => context.drawImage(img, x, y);
                });
        });
}

async function getImageInfo(image_code) {
    let info_url = `https://mapview.nls.uk/iiif/${image_code}/info.json`
    return fetch(info_url).then(response => response.json());
}

function createImageCodeFromID(id) {
    return `${id.slice(0, -4)}/${id}`;
}

function product() {
    var args = Array.prototype.slice.call(arguments);
    return args.reduce((accumulator, value) => {
        var tmp = [];
        accumulator.forEach((a0) => {
            value.forEach((a1) => {
                tmp.push(a0.concat(a1));
            });
        });
        return tmp;
    }, [[]]);
}

function getBase64Image(imgUrl) {
    return new Promise(resolve => {
        var img = new Image();
        img.src = imgUrl;
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = (() => {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
        });
    });
}