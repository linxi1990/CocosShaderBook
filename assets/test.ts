import { _decorator, Component, Node, Input, input, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {
    start() {
        input.on(Input.EventType.TOUCH_MOVE, (event:EventTouch) => {
            this.node.setWorldPosition(event.getUILocation().x, event.getUILocation().y, 0);
        });
    }

    update(deltaTime: number) {
        
    }
}


