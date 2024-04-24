import { _decorator, Component, Node, MeshRenderer } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('mapTool')
export class mapTool extends Component {

    @property
    size = 2;

    @property
    useShadow = true;

    @property
    set arrangeItems(v: boolean) {
        !this.isProccessing && this.setMap()
    }
    get arrangeItems() {
        return this.isProccessing;
    }



    private isProccessing = false;





    setMap() {
        this.isProccessing = true;
        const children = this.node.children;

        const L = children.length;
        if (this.useShadow) {

            const mesh = this.node.getComponentsInChildren(MeshRenderer);
            mesh.forEach((v) => {
                v.shadowCastingMode = 1;
            })
        }

        if (L > 3) {
            const grid = Math.round(Math.sqrt(L));
            const width = grid * this.size;

            for (var i = 0; i < L; i++) {

                const node = children[i];
                const x = width - (i % grid) * this.size * 2;
                const z = Math.floor(i / grid) * this.size * 2 - width;
                node.setPosition(x, 0, z)
                node.children[0].setPosition(0, 0, 0)

            }
        }

        this.isProccessing = false;


    }

}

