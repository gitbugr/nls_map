const max_loading = 4

let loading = [];
let loaded_images = 0;

async function draw(image_id) {
    loaded_images = 0;
    const canvas = document.getElementById('c');
    const dlLink = document.getElementById('downloadLink');
    const context = c.getContext('2d');

    const image_code = createImageCodeFromID(image_id);
    const info = await getImageInfo(image_code);

    const max_image_width = info.width;
    const max_image_height = info.height;

    const image_width = image_height = 512;

    const num_images = Math.ceil(max_image_width / image_width) * Math.ceil(max_image_height / image_height);
    document.querySelector('#max').innerText = num_images;

    dlLink.style.display = 'none';
    canvas.width = max_image_width;
    canvas.height = max_image_height;

    product([...Array(Math.ceil(max_image_width / image_width)).keys()], [...Array(Math.ceil(max_image_height / image_height)).keys()])
        .map(([x_index,y_index]) => [x_index * image_width, y_index * image_height])
        .forEach(([x,y]) => {
            getBase64Image(`https://map-view.nls.uk/iiif/${image_code}/${x},${y},${image_width},${image_height}/${image_width},${image_height}/0/default.jpg`)
                .then(value => {
                    let img = new Image();
                    img.src = value;
                    img.onload = () => {
                        context.drawImage(img, x, y);
                        if (num_images === loaded_images) {
                            dlLink.style.display = 'block';
                            dlLink.setAttribute('href', canvas.toDataURL('image/jpeg'));
                        }
                    }
                });
        });
}

async function getImageInfo(image_code) {
     info_url = `https://map-view.nls.uk/iiif/${image_code}/info.json`
    return fetch(info_url).then(response => response.json());
}

function createImageCodeFromID(id) {
    return `2/${id.slice(0,-4)}%2F${id.slice(0)}`;
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
        const x = setInterval(() => {
        const imgIndex = loading.indexOf(imgUrl)
            if (loading.length < max_loading && imgIndex === -1) {
                loading.push(imgUrl);
                clearInterval(x);
                var img = new Image();
                img.src = imgUrl;
                img.setAttribute('crossOrigin', 'anonymous');
                img.onerror = (() => {
                    loading.splice(loading.indexOf(imgUrl), 1);
                });
                img.onload = (() => {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var dataURL = canvas.toDataURL("image/png");
                    loading.splice(loading.indexOf(imgUrl), 1);
                    loaded_images += 1;
                    document.querySelector('#loaded').innerText = loaded_images;
                    resolve(dataURL);
                });
            }
        }, 50);
    });
}
