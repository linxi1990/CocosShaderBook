import { _decorator, Component, Node, Graphics, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('graphics')
export class graphics extends Component {
    start() {
        // const g = this.getComponent(Graphics);
        // g.lineWidth = 10;
        // g.fillColor.fromHEX('#ff0000');
        // g.moveTo(0, 0);
        // g.circle(0, 0, 20);
        // // g.lineTo(40, 0);
        // // g.lineTo(0, 80);
        // // g.close();
        // // g.stroke();
        // g.fill();
        // // g.c
    }

    update(deltaTime: number) {
        
    }

    drawCircleX(x:number, y:number){
        const g = this.getComponent(Graphics);
        g.lineWidth = 10;
        g.fillColor.fromHEX('#ff0000');
        // g.moveTo(x, y);
        g.circle(x, y, 10);
        // g.lineTo(40, 0);
        // g.lineTo(0, 80);
        // g.close();
        // g.stroke();
        g.fill();
    }
}


