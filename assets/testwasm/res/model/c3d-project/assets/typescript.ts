
import { _decorator, Component, Node, SkeletalAnimation, Prefab, instantiate, LabelComponent, EventTouch, UITransform, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Typescript')
export class Typescript extends Component {
 
    clipNames: Array<string> = [];

    @property(Node)
    content: Node = null;

    @property(Prefab)
    item = null;

    start () {

        let skeletal: SkeletalAnimation = this.node.getComponent(SkeletalAnimation) as SkeletalAnimation;
        skeletal.clips.forEach((clip: AnimationClip) => {
            let node: Node = instantiate(this.item);
            let label: LabelComponent = node.getComponent(LabelComponent) as LabelComponent;
            label.string = clip.name;
            this.content.addChild(node);
            node.on(Node.EventType.MOUSE_DOWN, () => {
                console.log(label.string);
                skeletal.play(label.string);
            }, this);
        });
    }

    playAnimation() {

    }


}
