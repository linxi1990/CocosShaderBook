import { _decorator, Component, Node, EventTouch, Input, input, Camera, geometry, PhysicsSystem, PhysicsRayResult, Mat4, view, Vec3, Vec4, Texture2D, ImageAsset, BufferAsset, RenderTexture, SpriteFrame, Sprite, director, MeshRenderer, UITransform } from 'cc';
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

    @property(MeshRenderer)
    mesh:MeshRenderer = null;

    private tex = new Texture2D();
    private r = 10;

    private _ray: geometry.Ray = new geometry.Ray();
    private _mask: number = 0xffffffff;
    private _raycastType: ERaycastType = ERaycastType.CLOSEST;
    private _maxDistance: number = 100;


    start() {
        let width = this.rt.width;
        let height = this.rt.height;
        let pixels = this.rt.readPixels(0, 0, width, height);

        this.createTexture();

        input.on(Input.EventType.TOUCH_MOVE, (event:EventTouch) => {
            let detal = event.touch.getDelta().x;
            this.mesh.node.getComponent(UITransform);
            let ang:Vec3 = new Vec3();
            ang = this.mesh.node.eulerAngles.add3f(0, detal, 0);
            this.mesh.node.eulerAngles = ang;
            
        })

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
                        //mvp矩阵
                        let mvpMat = new Mat4();
                        // Mat4.multiply(mvpMat, viewMat, mode);
                        Mat4.multiply(mvpMat, pMat, viewMat);

                        let hipPointTemp = new Vec4(r.hitPoint.x, r.hitPoint.y, r.hitPoint.z, 1);
                        Vec4.transformMat4(ppos, hipPointTemp, mvpMat);
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
        // let pixelBuf:ArrayBuffer = (this.tex.image.data as ArrayBufferView).buffer;

        let pixelBuf:Uint8Array = this.readPixels()
        let dataView = new DataView(pixelBuf.buffer);
        for(let i = 0; i <= this.r; i ++){
            for(let j = 0; j <= this.r; j ++){
                if(x - i >=0 && y - j >= 0){
                    dataView.setUint32((x-i) * 4 + (y-j)*1024*4, 0xff000000, true);
                }

                if(x - i >= 0 && y + j < 1024){
                    dataView.setUint32((x-i) * 4 + (y+j)*1024*4, 0xff000000, true);
                }

                if(x + 1 >= 0 && y - j >= 0){
                    dataView.setUint32((x+i) * 4 + (y-j)*1024*4, 0xff0000ff, true);
                } 

                if(x + 1 >= 0 && y + j >= 0){
                    dataView.setUint32((x+i) * 4 + (y+j)*1024*4, 0xff0000ff, true);
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

        // dataView.setUint32(x*1024 * 4 + y*4, 0xff0000ff, true);

        // director.root.device.copyTextureToBuffers()

        // director.root.device.copyBuffersToTexture()
        this.tex.uploadData(pixelBuf);

        this.mesh.materials[0].setProperty("mixTexture", this.tex);
        // let img:ImageAsset = new ImageAsset()
        // img.reset({
        //     _data:new Uint8Array(pixelBuf),
        //     _compressed:false,
        //     width:1024,
        //     height:1024,
        //     format:Texture2D.PixelFormat.RGBA8888
        // })
        // this.tex.image = img;

        // this.sp.spriteFrame.texture = this.tex;
    }

    public readPixels (x = 0, y = 0, width?: number, height?: number, buffer?: Uint8Array): Uint8Array | null {
        width = width || 1024;
        height = height || 1024;
        const gfxTexture = this.tex.getGFXTexture();
        if (!gfxTexture) {
            // errorID(7606);
            return null;
        }
        const needSize = 4 * width * height;
        if (buffer === undefined) {
            buffer = new Uint8Array(needSize);
        } else if (buffer.length < needSize) {
            // errorID(7607, needSize);
            return null;
        }

        // const gfxDevice = this._getGFXDevice();
        const gfxDevice = director.root.device;

        const bufferViews: ArrayBufferView[] = [];
        const regions: BufferTextureCopy[] = [];

        const region0 = new BufferTextureCopy();
        region0.texOffset.x = x;
        region0.texOffset.y = y;
        region0.texExtent.width = width;
        region0.texExtent.height = height;
        regions.push(region0);

        bufferViews.push(buffer);
        gfxDevice?.copyTextureToBuffers(gfxTexture, bufferViews, regions);
        return buffer;
    }

    update(deltaTime: number) {
        
    }
}

export class BufferTextureCopy {
    declare private _token: never; // to make sure all usages must be an instance of this exact class, not assembled from plain object

    constructor (
        public buffOffset: number = 0,
        public buffStride: number = 0,
        public buffTexHeight: number = 0,
        public texOffset: Offset = new Offset(),
        public texExtent: Extent = new Extent(),
        public texSubres: TextureSubresLayers = new TextureSubresLayers(),
    ) {}

    public copy (info: Readonly<BufferTextureCopy>) {
        this.buffOffset = info.buffOffset;
        this.buffStride = info.buffStride;
        this.buffTexHeight = info.buffTexHeight;
        this.texOffset.copy(info.texOffset);
        this.texExtent.copy(info.texExtent);
        this.texSubres.copy(info.texSubres);
        return this;
    }
}

export class TextureSubresLayers {
    declare private _token: never; // to make sure all usages must be an instance of this exact class, not assembled from plain object

    constructor (
        public mipLevel: number = 0,
        public baseArrayLayer: number = 0,
        public layerCount: number = 1,
    ) {}

    public copy (info: Readonly<TextureSubresLayers>) {
        this.mipLevel = info.mipLevel;
        this.baseArrayLayer = info.baseArrayLayer;
        this.layerCount = info.layerCount;
        return this;
    }
}

export class Offset {
    declare private _token: never; // to make sure all usages must be an instance of this exact class, not assembled from plain object

    constructor (
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
    ) {}

    public copy (info: Readonly<Offset>) {
        this.x = info.x;
        this.y = info.y;
        this.z = info.z;
        return this;
    }
}

export class Extent {
    declare private _token: never; // to make sure all usages must be an instance of this exact class, not assembled from plain object

    constructor (
        public width: number = 0,
        public height: number = 0,
        public depth: number = 1,
    ) {}

    public copy (info: Readonly<Extent>) {
        this.width = info.width;
        this.height = info.height;
        this.depth = info.depth;
        return this;
    }
}
