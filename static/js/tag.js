// A Javascript function for creating tags quickly
// Create by Stephen M. Pruitt

function tag() {
    var node,
        args = arguments,

        compose = function (item, i) {
            if (i == 0) {
                node = document.createElement(item);
                if (item == 'a') node.setAttribute('href', '#');
            } else if (typeof item == 'string' || typeof item == 'number') {
                node.appendChild(document.createTextNode(item));
            } else if (item.tagName) {
                node.appendChild(item);
            } else if (Array.isArray(item)) {
                for (var i = 0, l = item.length; i < l; i++) {
                    compose(item[i]);
                }
            } else {
                for (var p in item) {
                    if (/^on/.test(p)) {
                        node.addEventListener(p.substring(2, p.length), item[p]);
                    } else if (typeof item[p] == 'boolean') {
                        if (item[p]) node.setAttribute(p, '');
                    } else {
                        node.setAttribute(p, item[p]);
                    }
                }
            }
        }

    for (var i = 0, l = args.length; i < l; i++) {
        compose(args[i], i);
    }

    return node;
}
