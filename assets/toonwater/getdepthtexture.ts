import { _decorator, Component, Node, RenderTexture, MeshRenderer, director, Sprite, SpriteFrame, Texture2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('getdepthtexture')
export class getdepthtexture extends Component {
    @property(RenderTexture)
    renderTexture:RenderTexture;

    @property
    samplerName:string = '';

    @property(Sprite)
    sp:Sprite = null;

    start() {
        let material = this.node.getComponent(MeshRenderer).material;
        material.setProperty(this.samplerName, this.renderTexture.window.framebuffer.depthStencilTexture);
        let pass0 = material.passes[0];
        let bindingIndex = pass0.getBinding(this.samplerName);
        pass0.bindTexture(bindingIndex, this.renderTexture.window.framebuffer.depthStencilTexture);
        pass0.bindSampler(bindingIndex, director.root.pipeline.globalDSManager.pointSampler);

        // var temp = document.createElement("a");
        // temp.download = 'test.png';
        // temp.href = URL.createObjectURL(new Blob([this.renderTexture.readPixels(0, 0, 1280, 960)]));
        // temp.click();
        // document.removeChild(temp)

        // let spriteFrame = new SpriteFrame();
        // let tex = new Texture2D();
        // spriteFrame.texture = this.renderTexture.window.framebuffer.depthStencilTexture;

        // this.sp.spriteFrame 
    }
}


