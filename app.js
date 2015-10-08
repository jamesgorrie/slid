import Rx from 'rx';
import {int} from 'util';

import {getMovementIn} from 'leap';

const followMe = document.getElementById('follow-me');
const imgContainer = document.getElementById('image-container');
const img = document.getElementById('image');
const rows = int(imgContainer.getAttribute('data-rows'));
const cols = int(imgContainer.getAttribute('data-cols'));

// TODO: Once this return's a promise make is Leap || Mouse
const inputCoords$ = getMovementIn(imgContainer);
//const inputCoords$ = Rx.Observable.
//    fromEvent(followMe, 'mousemove', e => e, true).map(e => ({ x: e.offsetX, y: e.offsetY }));

const rowsCols$ = new Rx.Subject().startWith({ rows, cols });

const imageDims$ = Rx.Observable.fromEvent(img, 'load').
    map(e => ({ w: e.srcElement.width, h: e.srcElement.height }));
img.src = img.getAttribute('data-src');

const containerSize$ = rowsCols$.combineLatest(imageDims$, (rowsCols, imageDims) =>
    ({ w: int(imageDims.w/rowsCols.cols), h: int(imageDims.h/rowsCols.rows) })
);

const frameCount$ = rowsCols$.map(rowsCols => rowsCols.rows * rowsCols.cols);

const cursorPercent$ = inputCoords$.
    combineLatest(containerSize$, (loc, size) =>
        ({x: int((loc.x / size.w) * 100), y: int((loc.y / size.h) * 100)}));

const currentFrame$ = frameCount$.combineLatest(cursorPercent$,
    (frameCount, percent) => Math.max(int((percent.x * frameCount) / 100), 1));

const imagePos$ = currentFrame$.combineLatest(rowsCols$, (frame, rowsCols) => {
    const row = Math.ceil(frame/rowsCols.cols);
    const col = frame % rowsCols.cols === 0 ? frame/row : frame % rowsCols.cols;

    return {row, col};
}).combineLatest(containerSize$, (rowCol, size) => ({
    left: size.w * (rowCol.col-1),
    top: size.h * (rowCol.row-1)
}));

imagePos$.subscribe(pos => {
    img.style.left = `-${pos.left}px`;
    img.style.top = `-${pos.top}px`;
});

containerSize$.subscribe(size => {
    imgContainer.style.width  = `${size.w}px`;
    imgContainer.style.height = `${size.h}px`;
});
