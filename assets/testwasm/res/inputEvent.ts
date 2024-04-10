import { _decorator, Component, Node, EventTouch, Input, input, Camera, geometry, PhysicsSystem, PhysicsRayResult, Mat4, view, Vec3, Vec4, Texture2D, ImageAsset, BufferAsset, RenderTexture, SpriteFrame, Sprite } from 'cc';
import { graphics } from './graphics';
const { ccclass, property } = _decorator;

const enum ERaycastType {
    ALL,
    CLOSEST
}

const ppos:Vec4 = new Vec4();

@ccclass('inputEvent')
export class inputEvent extends Component {
    @property(Camera)
    mainCamera: Camera = null;

    @property(graphics)
    pen:graphics = null;

    @property(RenderTexture)
    rt:RenderTexture = null;

    @property(Sprite)
    sp:Sprite = null;

    private tex = new Texture2D();
    private r = 3;

    private _ray: geometry.Ray = new geometry.Ray();
    private _mask: number = 0xffffffff;
    private _raycastType: ERaycastType = ERaycastType.CLOSEST;
    private _maxDistance: number = 100;


    start() {
        let width = this.rt.width;
        let height = this.rt.height;
        let pixels = this.rt.readPixels(0, 0, width, height);

        this.createTexture();

        input.on(Input.EventType.TOUCH_START, (event: EventTouch) => {
            console.log("Touch Start");
            console.log(event.touch.getLocation());

            this.mainCamera.screenPointToRay(event.touch.getLocationX(), event.touch.getLocationY(), this._ray);

            switch (this._raycastType) {
                case ERaycastType.ALL:
                    if (PhysicsSystem.instance.raycast(this._ray, this._mask, this._maxDistance)) {
                        const r:PhysicsRayResult[] = PhysicsSystem.instance.raycastResults;

                    }
                    break;
                case ERaycastType.CLOSEST:
                    if (PhysicsSystem.instance.raycastClosest(this._ray, this._mask)) {
                        const r:PhysicsRayResult = PhysicsSystem.instance.raycastClosestResult;
                        console.log(`射线检测碰撞的点坐标${r.hitPoint}`);
                        let mode:Mat4 = new Mat4();
                        r.collider.node.getWorldMatrix(mode);

                        //视图矩阵
                        let viewMat = new Mat4();
                        let tempView:Mat4 = this.mainCamera.node.getWorldRT();
                        Mat4.invert(viewMat, tempView);
                        //投影矩阵
                        let pMat = new Mat4();
                        let fovy = Math.PI / 4;
                        let aspect = view.getViewportRect().width / view.getViewportRect().height
                        Mat4.perspective(pMat, fovy, aspect, 1, 1000)
                        //pv矩阵
                        let pvMat = new Mat4();
                        Mat4.multiply(pvMat, pMat, viewMat);

                        let hipPointTemp = new Vec4(r.hitPoint.x, r.hitPoint.y, r.hitPoint.z, 1);
                        Vec4.transformMat4(ppos, hipPointTemp, pvMat);
                        ppos.divide4f(ppos.w, ppos.w, ppos.w, ppos.w);

                        ppos.multiplyScalar(0.5).add4f(0.5, 0.5, 0.5, 0.5);

                        console.log(`转化后的纹理坐标${ppos}`)
                    
                        //映射到纹理坐标
                        let texX = Math.floor(1024 * ppos.x);
                        let texY = Math.floor(1024 * ppos.y);

                        console.log(texX, texY);

                        this.drawAt(texX, texY);
                        // this.pen.drawCircle(texX, texY);
                    }    
                    break;
            }
        });
    }

    createBuffer() {
        let buf = new ArrayBuffer(1024 * 1024 * 4);
        let dataView = new DataView(buf);

        for (let i = 0; i < 1024 * 1024; i++) {
            dataView.setUint32(i * 4, 0xFFFFFFFF, true);
        }
    }

    createTexture() {
        let buf = new ArrayBuffer(1024 * 1024 * 4);
        let dataView = new DataView(buf);

        for (let i = 0; i < 1024 * 1024; i++) {
            dataView.setUint32(i * 4, 0xFFFFFF11, true);
        }
        
        this.tex = new Texture2D();
        let img:ImageAsset = new ImageAsset()
        img.reset({
            _data:new Uint8Array(buf),
            _compressed:false,
            width:1024,
            height:1024,
            format:Texture2D.PixelFormat.RGBA8888
        })
        this.tex.image = img;

        this.sp.spriteFrame.texture = this.tex;
    }

    drawAt(x:number, y:number){
        let pixelBuf:ArrayBuffer = (this.tex.image.data as ArrayBufferView).buffer;
        let dataView = new DataView(pixelBuf);
        for(let i = 1; i <= this.r; i ++){
            for(let j = 1; j <= this.r; j ++){
                if(x - i >=0 && y - j >= 0){
                    dataView.setUint32((x-i)*1024 * 4 + (y-j)*4, 0xff0000ff, true);
                }

                if(x - i >= 0 && y + j < 1024){
                    dataView.setUint32((x-i)*1024 * 4 + (y+j)*4, 0xff0000ff, true);
                }

                
            }
            // if(x - i >= 0 && y - i >= 0){
            //     dataView.setUint32((x-i)*1024 * 4 + (y-i)*4, 0xff0000ff, true);
            // }

            // if(x - i >= 0 && y + i >= 0){
            //     dataView.setUint32((x-i)*1024 * 4 + (y-i)*4, 0xff0000ff, true);
            // }

            // if(x + i <= 1024 && y - i >= 0){
            //     dataView.setUint32((x+i)*1024 * 4 + (y-i)*4, 0xff0000ff, true);
            // }
        }
        dataView.setUint32(x*1024 * 4 + y*4, 0xff0000ff, true);
    }

    update(deltaTime: number) {
        
    }
}


