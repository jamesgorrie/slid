import Rx from 'rx';
import {int} from 'util';

function connectAndGetMovementInBox(elem) {
    const controller = new Leap.Controller();
    const pos$ = new Rx.Subject();

    controller.on('frame', frame => {
        if(frame.pointables.length > 0) {
            // FIXME: Reading from the DOM each time? Good one.
            const w = elem.clientWidth;
            const h = elem.clientHeight;
            const pointable = frame.pointables[0];
            const interactionBox = frame.interactionBox;
            const normalisedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);

            const x = int(w * normalisedPosition[0]);
            const y = int(h * (1 - normalisedPosition[1]));

            pos$.onNext({ x, y });
        }
    });
    controller.connect();

    // TODO: Make this a promise that reject when not connected
    return pos$;
}

export const getMovementIn = elem => {
    return connectAndGetMovementInBox(elem);
};