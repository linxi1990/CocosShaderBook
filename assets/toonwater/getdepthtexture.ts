import { _decorator, Component, Node, RenderTexture, MeshRenderer, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('getdepthtexture')
export class getdepthtexture extends Component {
    @property(RenderTexture)
    renderTexture:RenderTexture;

    @property
    samplerName:string = 'depthTexture';

    start() {
        let material = this.node.getComponent(MeshRenderer).sharedMaterial;
        material.setProperty(this.samplerName, this.renderTexture.window.framebuffer.depthStencilTexture);
        let pass0 = material.passes[0];
        let bindingIndex = pass0.getBinding(this.samplerName);
        pass0.bindSampler(bindingIndex, director.root.pipeline.globalDSManager.pointSampler);
    }
}


