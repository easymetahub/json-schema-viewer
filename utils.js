export function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

export function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className))
    el.className += " " + className
}

export function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}

export function calculateLine(link) {
    var lx1, lx2, ly1, ly2;

    var xIntersect = (link.source.x <= link.target.x && link.source.x + link.source.width >= link.target.x)
        || (link.target.x <= link.source.x && link.target.x + link.target.width >= link.source.x);
    var yIntersect = link.source.y <= link.target.y && link.source.y + link.source.height >= link.target.y
        || (link.target.y <= link.source.y && link.target.y + link.target.height >= link.source.y);

    if (xIntersect) {
        lx1 = link.source.x + link.source.width / 2;
        lx2 = link.target.x + link.target.width / 2;
        if (link.source.y + link.source.height <= link.target.y) {
            //source higher
            ly1 = link.source.y + link.source.height;
            ly2 = link.target.y;
        }
        else {
            ly1 = link.source.y;
            ly2 = link.target.y + link.target.height;
        }

        link.lineType = "LINE_TYPE_RECT_2BREAK";
        link.lineStart = "LINE_START_VERTICAL";
    }
    else if (yIntersect) {
        ly1 = link.source.y + link.source.height / 2;
        ly2 = link.target.y + link.target.height / 2;
        if (link.source.x + link.source.width <= link.target.x) {
            lx1 = link.source.x + link.source.width;
            lx2 = link.target.x;
        }
        else {
            lx1 = link.source.x;
            lx2 = link.target.x + link.target.width;
        }
        link.lineType = "LINE_TYPE_RECT_2BREAK";
        link.lineStart = "LINE_START_HORIZONTAL";
    }
    else {
        if (link.source.y + link.source.height <= link.target.y) {
            //source higher
            ly1 = link.source.y + link.source.height / 2;
            ly2 = link.target.y;
            if (link.source.x + link.source.width <= link.target.x) {
                lx1 = link.source.x + link.source.width;
            }
            else {
                lx1 = link.source.x;
            }
            lx2 = link.target.x + link.target.width / 2;
        }
        else {
            ly1 = link.source.y + link.source.height / 2;
            ly2 = link.target.y + link.target.height;
            if (link.source.x + link.source.width <= link.target.x) {
                lx1 = link.source.x + link.source.width;
            }
            else {
                lx1 = link.source.x;
            }
            lx2 = link.target.x + link.target.width / 2;
        }
        link.lineType = "LINE_TYPE_RECT_1BREAK";
        link.lineStart = "LINE_START_HORIZONTAL";
    }
    return { x1: lx1, y1: ly1, x2: lx2, y2: ly2};
}
