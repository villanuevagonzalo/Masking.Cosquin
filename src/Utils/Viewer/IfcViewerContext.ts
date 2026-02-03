// ifc-viewer-context.ts
import * as THREE from 'three';
import { Components, Worlds, SimpleScene, OrthoPerspectiveCamera } from '@thatopen/components';
import { IfcImporter, FragmentsModel, ProgressData } from '@thatopen/fragments';
import { PostproductionRenderer } from '@thatopen/components-front';
import { convertIFCPathtoFragmentBytes, initFragmentsManager } from '../IfcUtils';

export interface ViewerContextOptions {
  background?: THREE.ColorRepresentation;
  dynamicAnchor?: boolean;
}

export class IfcViewerContext {
  // Core
  public readonly components = new Components();
  public readonly worlds = this.components.get(Worlds);
  public readonly world = this.worlds.create<
    SimpleScene,
    OrthoPerspectiveCamera,
    PostproductionRenderer
  >();
  public readonly fragmentsManager = initFragmentsManager(this.components);

  // IFC / Fragments
  public readonly importer = new IfcImporter();
  public currentModel?: FragmentsModel;
  public loadingModel = false;
  public loadingProgress = 0;
  public loadingMessage: ProgressData[] = [];

  // DOM / State
  public container?: HTMLElement;
  private _resizeObs?: ResizeObserver;
  private _initialized = false;

  get renderer() {
    return this.world.renderer;
  }

  private _ensureInit() {
    if (!this._initialized) {
      throw new Error(
        'ViewerContext not initialized. Call init(container) first.',
      );
    }
  }

  async init(container: HTMLElement, opts: ViewerContextOptions = {}) {
    if (this._initialized) return;
    this.container = container;

    // Scene
    this.world.scene = new SimpleScene(this.components);
    this.world.scene.setup();
    this.world.scene.three.background = new THREE.Color(
      opts.background ?? 'black',
    );

    // Renderer
    this.world.renderer = new PostproductionRenderer(
      this.components,
      this.container,
    );
    this.world.dynamicAnchor = opts.dynamicAnchor ?? false;

    // Basic Camera
    this.world.camera = new OrthoPerspectiveCamera(this.components);
    this.components.init();

    this.world.renderer.postproduction.enabled = true;

    
    this.world.camera.projection.onChanged.add(() => {
      this.currentModel?.useCamera(this.world?.camera?.three);
      this.world.camera.controls.update(0);
      this.world.renderer?.postproduction.updateCamera();
      this.fragmentsManager.core.update(true);
    });

    this.world.camera.projection.set('Perspective');

    this.importer.wasm = { absolute: true, path: 'assets/web-ifc/' };

    // Resize handling
    // this._resizeObs = new ResizeObserver(() => this._handleResize());
    // this._resizeObs.observe(container);
    // this._handleResize();

    this._initialized = true;
  }

  async loadModel(ifcPath: string, modelId = 'example'): Promise<void> {
    this.loadingModel = true;

    const fragmentBytes: ArrayBuffer = await convertIFCPathtoFragmentBytes(
      this.importer,
      ifcPath,
    );
    if (!fragmentBytes) return;

    this.currentModel = await this.fragmentsManager.core.load(fragmentBytes, {
      modelId,
    });
    if (!this.currentModel) return;

    this.currentModel.useCamera(this.world.camera.three);

    this.world.scene.three.add(this.currentModel.object);
    await this.fragmentsManager.core.update(true);

    this.loadingModel = false;
  }

  dispose() {
    this.currentModel?.dispose();
    this.components.dispose();
    this.fragmentsManager.core.dispose();

    this._resizeObs?.disconnect();
    this._resizeObs = undefined;

    if (this.container) {
      const canvases = this.container.querySelectorAll('canvas');
      canvases.forEach((c) => c.remove());
    }

    this.container = undefined;
    this._initialized = false;
  }

}
